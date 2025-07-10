import { Injectable } from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto, userId: string) {
    // Ensure a user record exists before creating a form linked to it.
    await this.prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    return this.prisma.form.create({
      data: {
        title: createFormDto.title,
        fields: (createFormDto.fields as unknown as Prisma.JsonArray) || [],
        theme: (createFormDto.theme as Prisma.JsonObject) || {},
        postSubmissionSettings:
          (createFormDto.postSubmissionSettings as Prisma.JsonObject) ||
          undefined,
        userId,
      },
    });
  }

  async logFormView(formId: string) {
    // Check if the form exists
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      select: { id: true },
    });

    if (!form) {
      // It's better to fail silently or just log,
      // as to not expose form existence or cause client-side errors
      console.warn(
        `Attempted to log a view for a non-existent form: ${formId}`,
      );
      return;
    }

    await this.prisma.formView.create({
      data: {
        formId: formId,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.form.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findOne(id: string, userId: string) {
    return this.prisma.form.findUnique({
      where: { id, userId },
    });
  }

  findOnePublicly(id: string) {
    return this.prisma.form.findUnique({
      where: { id },
    });
  }

  async update(id: string, userId: string, updateFormDto: UpdateFormDto) {
    // First, verify the form belongs to the user
    const form = await this.prisma.form.findUnique({
      where: { id, userId },
    });

    if (!form) {
      throw new Error(
        'Form not found or you do not have permission to edit it.',
      );
    }

    return this.prisma.form.update({
      where: { id },
      data: {
        title: updateFormDto.title,
        fields: updateFormDto.fields as unknown as Prisma.JsonArray,
        theme: updateFormDto.theme as Prisma.JsonObject,
        postSubmissionSettings:
          (updateFormDto.postSubmissionSettings as Prisma.JsonObject) ||
          undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    // First, verify the form belongs to the user
    const form = await this.prisma.form.findUnique({
      where: { id, userId },
    });

    if (!form) {
      throw new Error(
        'Form not found or you do not have permission to delete it.',
      );
    }

    // Delete in the correct order due to foreign key constraints:
    // Files → Answers → Submissions → Form
    await this.prisma.$transaction(async (prisma) => {
      // Get all submissions for this form
      const submissions = await prisma.formSubmission.findMany({
        where: { formId: id },
        select: { id: true },
      });

      if (submissions.length > 0) {
        const submissionIds = submissions.map((s) => s.id);

        // Delete files first (they reference answers)
        await prisma.file.deleteMany({
          where: {
            answer: {
              submissionId: { in: submissionIds },
            },
          },
        });

        // Delete answers (they reference submissions)
        await prisma.answer.deleteMany({
          where: {
            submissionId: { in: submissionIds },
          },
        });

        // Delete submissions (they reference the form)
        await prisma.formSubmission.deleteMany({
          where: { formId: id },
        });
      }

      // Delete form views (they reference the form)
      await prisma.formView.deleteMany({
        where: { formId: id },
      });

      // Finally, delete the form
      await prisma.form.delete({
        where: { id },
      });
    });

    return { message: 'Form deleted successfully' };
  }
}
