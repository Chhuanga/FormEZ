import { FormSubmission } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class IntegrationsService {
    private prisma;
    constructor(prisma: PrismaService);
    onFormSubmission(formId: string, submission: FormSubmission): void;
    getAccounts(userId: string): never[];
    findAllByFormId(formId: string, userId: string): never[];
}
