import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseGuard } from '../auth/firebase.guard';
import { CurrentUser } from '../auth/auth.decorators';
import { DecodedIdToken } from 'firebase-admin/auth';

@Controller('forms/:formId/collaborators')
@UseGuards(FirebaseGuard)
export class CollaboratorsController {
  constructor(private prisma: PrismaService) {}

  @Post('request')
  async requestAccess(@Param('formId') formId: string, @CurrentUser() user: DecodedIdToken) {
    const userId = user.uid;
    const userEmail = user.email || '';
    const userName = user.name || user.displayName || userEmail || 'Anonymous';

    // Check if form exists
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Check if already a collaborator or owner
    if (form.userId === userId) {
      return { message: 'You are the owner of this form' };
    }

    const existingCollaboration = await this.prisma.formCollaborator.findUnique({
      where: {
        formId_userId: {
          formId,
          userId,
        },
      },
    });

    if (existingCollaboration) {
      return { message: 'You are already a collaborator' };
    }

    // Create user record if it doesn't exist
    await this.prisma.user.upsert({
      where: { id: userId },
      update: {
        email: userEmail,
        name: userName,
      },
      create: {
        id: userId,
        email: userEmail,
        name: userName,
      },
    });

    // Auto-approve collaboration request and create collaborator record
    const collaboration = await this.prisma.formCollaborator.create({
      data: {
        formId,
        userId,
        role: 'editor',
      },
    });

    return {
      message: 'Access granted - you are now a collaborator!',
      collaboration,
    };
  }
}
