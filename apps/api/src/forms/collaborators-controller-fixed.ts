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

  @Get()
  async getCollaborators(
    @Param('formId') formId: string,
    @CurrentUser() user: DecodedIdToken,
  ) {
    const userId = user.uid;

    // Check if user has access to this form
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const isOwner = form.userId === userId;
    const isCollaborator = form.collaborators.some((c) => c.userId === userId);

    if (!isOwner && !isCollaborator) {
      throw new ForbiddenException('Access denied');
    }

    return form.collaborators.map((c) => ({
      id: c.id,
      userId: c.userId,
      role: c.role,
      user: c.user,
      createdAt: c.createdAt,
    }));
  }

  @Post('invite')
  async inviteCollaborator(
    @Param('formId') formId: string,
    @Body('email') email: string,
    @CurrentUser() user: DecodedIdToken,
  ) {
    const userId = user.uid;

    // Check if user owns this form
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId !== userId) {
      throw new ForbiddenException(
        'Only the form owner can invite collaborators',
      );
    }

    // Find user by email
    const invitedUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      throw new NotFoundException('User with this email not found');
    }

    // Check if already a collaborator
    const existingCollaboration = await this.prisma.formCollaborator.findUnique({
      where: {
        formId_userId: {
          formId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingCollaboration) {
      throw new ForbiddenException('User is already a collaborator');
    }

    // Create collaboration
    const collaboration = await this.prisma.formCollaborator.create({
      data: {
        formId,
        userId: invitedUser.id,
        role: 'editor',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // TODO: Send email notification to invited user

    return {
      id: collaboration.id,
      userId: collaboration.userId,
      role: collaboration.role,
      user: collaboration.user,
      createdAt: collaboration.createdAt,
    };
  }

  @Post('request')
  async requestAccess(
    @Param('formId') formId: string,
    @CurrentUser() user: DecodedIdToken,
  ) {
    const userId = user.uid;
    const userEmail = user.email || '';
    const userName = user.name || user.displayName || userEmail;

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

  @Delete(':collaboratorId')
  async removeCollaborator(
    @Param('formId') formId: string,
    @Param('collaboratorId') collaboratorId: string,
    @CurrentUser() user: DecodedIdToken,
  ) {
    const userId = user.uid;

    // Check if user owns this form
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId !== userId) {
      throw new ForbiddenException(
        'Only the form owner can remove collaborators',
      );
    }

    // Remove collaborator
    await this.prisma.formCollaborator.delete({
      where: { id: collaboratorId },
    });

    return { message: 'Collaborator removed successfully' };
  }
}
