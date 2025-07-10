import { Injectable } from '@nestjs/common';
import { FormSubmission } from '@prisma/client';

@Injectable()
export class IntegrationsService {
  onFormSubmission(formId: string, submission: FormSubmission) {
    // TODO: Implement integration logic (e.g., send to Zapier, Slack, etc.)
    console.log(`New submission for form ${formId}:`, submission.id);
  }

  getAccounts(userId: string) {
    // TODO: Replace with actual account fetching logic
    console.log('Fetching accounts for user:', userId);
    return [];
  }
}
