import { Injectable } from '@nestjs/common';
import { FormSubmission } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  onFormSubmission(formId: string, submission: FormSubmission) {
    // TODO: Implement integration logic (e.g., send to Zapier, Slack, etc.)
    console.log(`New submission for form ${formId}:`, submission.id);
  }

  getAccounts(userId: string) {
    // TODO: Replace with actual account fetching logic
    console.log('Fetching accounts for user:', userId);
    return [];
  }

  findAllByFormId(formId: string, userId: string) {
    // TODO: Integration model not yet implemented in schema
    // Return empty array until integration model is added
    console.log(`Finding integrations for form ${formId} and user ${userId}`);
    return [];

    // Uncomment when Integration model is added to Prisma schema:
    // return await this.prisma.integration.findMany({
    //   where: {
    //     formId,
    //     form: {
    //       userId,
    //     },
    //   },
    // });
  }
}
