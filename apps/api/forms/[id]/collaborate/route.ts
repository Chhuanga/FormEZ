import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'firebase-admin/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Find the form and check collaboration access
    const form = await prisma.form.findUnique({
      where: { id: params.id },
      include: {
        collaborators: true,
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Check if user is owner or collaborator
    const isOwner = form.userId === userId;
    const isCollaborator = form.collaborators.some(c => c.userId === userId);

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Return form data for collaboration
    return NextResponse.json({
      id: form.id,
      title: form.title,
      fields: form.fields,
      theme: form.theme,
      formSettings: form.formSettings,
      postSubmissionSettings: form.postSubmissionSettings,
      ownerId: form.userId,
      collaborators: form.collaborators.map(c => c.userId),
    });

  } catch (error) {
    console.error('Collaboration access error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
