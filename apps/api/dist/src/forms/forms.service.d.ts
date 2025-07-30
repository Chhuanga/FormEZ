import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IntegrationsService } from 'src/integrations/integrations.service';
export declare class FormsService {
    private prisma;
    private integrationsService;
    constructor(prisma: PrismaService, integrationsService: IntegrationsService);
    create(createFormDto: CreateFormDto, userId: string): Promise<{
        id: string;
        title: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        formSettings: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    logFormView(formId: string): Promise<void>;
    findAll(userId: string): Prisma.PrismaPromise<{
        id: string;
        title: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        formSettings: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }[]>;
    findOne(id: string, userId: string): Prisma.Prisma__FormClient<{
        id: string;
        title: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        formSettings: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findOnePublicly(id: string): Prisma.Prisma__FormClient<{
        id: string;
        title: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        formSettings: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, userId: string, updateFormDto: UpdateFormDto): Promise<{
        id: string;
        title: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        formSettings: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    findSubmissions(formId: string, userId: string): Promise<{
        submissions: ({
            answers: ({
                file: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    filename: string;
                    mimetype: string;
                    size: number;
                    path: string;
                    answerId: string;
                } | null;
            } & {
                value: Prisma.JsonValue;
                id: string;
                fieldId: string;
                createdAt: Date;
                updatedAt: Date;
                submissionId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            formId: string;
        })[];
    } & {
        id: string;
        title: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        formSettings: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    getIntegrations(formId: string, userId: string): never[];
}
