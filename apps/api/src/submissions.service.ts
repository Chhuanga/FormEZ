import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
import {
  AnswerDto,
  CreateSubmissionDto,
} from './submissions/dto/create-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(formId: string, createSubmissionDto: CreateSubmissionDto) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const formFields = form.fields as any[];
    const { answers } = createSubmissionDto;

    for (const field of formFields) {
      if (field.validation?.required) {
        const answer = answers[field.id];
        if (
          !answer ||
          answer.value === null ||
          answer.value === undefined ||
          answer.value === '' ||
          (Array.isArray(answer.value) && answer.value.length === 0)
        ) {
          throw new BadRequestException(`${field.label} is a required field.`);
        }
      }
    }

    const submission = await this.prisma.formSubmission.create({
      data: {
        formId,
        answers: {
          create: Object.entries(answers).map(
            ([fieldId, answer]: [string, AnswerDto]) => {
              return {
                fieldId,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                value: answer.value as any,
              };
            },
          ),
        },
      },
      include: {
        answers: {
          include: {
            file: true,
          },
        },
      },
    });
    return submission;
  }

  async findByFormId(formId: string, userId: string) {
    // First, verify the user owns this form
    const form = await this.prisma.form.findUnique({
      where: { id: formId, userId },
      include: {
        submissions: {
          include: {
            answers: {
              include: {
                file: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(
        'Form not found or you do not have permission to view its submissions',
      );
    }

    return {
      form: {
        id: form.id,
        title: form.title,
        fields: form.fields,
      },
      submissions: form.submissions,
    };
  }

  async getAnalyticsByFormId(formId: string, userId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId, userId },
      include: {
        submissions: {
          include: {
            answers: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(
        'Form not found or you do not have permission to view its analytics',
      );
    }

    // 1. Submission Trend
    const submissionTrend = form.submissions.reduce((acc, submission) => {
      const date = submission.createdAt.toISOString().split('T')[0];
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ date, count: 1 });
      }
      return acc;
    }, [] as { date: string; count: number }[]);

    // 2. Field Analytics
    const formFields = (form.fields as any[]).filter(
      (field) =>
        field.type === 'RadioGroup' ||
        field.type === 'Select' ||
        field.type === 'Checkbox',
    );

    const fieldAnalytics = formFields.map((field) => {
      const counts: Record<string, number> = {};
      if (field.options) {
        field.options.forEach((option: string) => {
          counts[option] = 0;
        });
      }

      for (const submission of form.submissions) {
        const answer = submission.answers.find((a) => a.fieldId === field.id);
        if (answer && answer.value) {
          const value = answer.value as Prisma.JsonValue;
          if (Array.isArray(value)) {
            // Checkbox
            for (const option of value) {
              if (typeof option === 'string' && option in counts) {
                counts[option]++;
              }
            }
          } else if (typeof value === 'string') {
            // RadioGroup, Select
            if (value in counts) {
              counts[value]++;
            }
          }
        }
      }

      return {
        fieldId: field.id,
        label: field.label,
        type: field.type,
        options: Object.entries(counts).map(([option, count]) => ({
          option,
          count,
        })),
      };
    });

    return {
      submissionTrend,
      fieldAnalytics,
    };
  }

  async findOne(submissionId: string, userId: string) {
    const submission = await this.prisma.formSubmission.findUnique({
      where: { id: submissionId },
      include: {
        form: {
          select: {
            userId: true,
            title: true,
            fields: true,
          },
        },
        answers: {
          include: {
            file: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.form.userId !== userId) {
      throw new NotFoundException(
        'Submission not found or you do not have permission to view it',
      );
    }

    return submission;
  }
}
