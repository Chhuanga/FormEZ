import { PrismaService } from '../prisma/prisma.service';
import { DecodedIdToken } from 'firebase-admin/auth';
export declare class CollaboratorsController {
    private prisma;
    constructor(prisma: PrismaService);
    getCollaborators(formId: string, user: DecodedIdToken): Promise<{
        id: string;
        userId: string;
        role: string;
        user: {
            id: string;
            email: string;
            image: string | null;
            name: string | null;
        };
        createdAt: Date;
    }[]>;
    inviteCollaborator(formId: string, email: string, user: DecodedIdToken): Promise<{
        id: string;
        userId: string;
        role: string;
        user: {
            id: string;
            email: string;
            image: string | null;
            name: string | null;
        };
        createdAt: Date;
    }>;
    requestAccess(formId: string, user: DecodedIdToken): Promise<{
        message: string;
        collaboration?: undefined;
    } | {
        message: string;
        collaboration: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            formId: string;
            role: string;
        };
    }>;
    removeCollaborator(formId: string, collaboratorId: string, user: DecodedIdToken): Promise<{
        message: string;
    }>;
}
