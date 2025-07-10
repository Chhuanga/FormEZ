import { FormSubmission } from '@prisma/client';
export declare class IntegrationsService {
    onFormSubmission(formId: string, submission: FormSubmission): void;
    getAccounts(userId: string): never[];
}
