import { PrismaService } from '../prisma/prisma.service';
import { DecodedIdToken } from 'firebase-admin/auth';
export declare class CollaboratorsController {
    private prisma;
    constructor(prisma: PrismaService);
    requestAccess(formId: string, user: DecodedIdToken): Promise<{
        message: string;
        collaboration?: undefined;
    } | {
        message: string;
        collaboration: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            formId: string;
            userId: string;
            role: string;
        };
    }>;
}
