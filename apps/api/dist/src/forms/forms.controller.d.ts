import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { DecodedIdToken } from 'firebase-admin/auth';
export declare class FormsController {
    private readonly formsService;
    constructor(formsService: FormsService);
    create(createFormDto: CreateFormDto, user: DecodedIdToken): Promise<{
        id: string;
        title: string;
        fields: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue;
        formSettings: import("@prisma/client/runtime/library").JsonValue;
        postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    logFormView(id: string): void;
    findAll(user: DecodedIdToken): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        title: string;
        fields: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue;
        formSettings: import("@prisma/client/runtime/library").JsonValue;
        postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }[]>;
    findOne(id: string, user: DecodedIdToken): import("@prisma/client").Prisma.Prisma__FormClient<{
        id: string;
        title: string;
        fields: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue;
        formSettings: import("@prisma/client/runtime/library").JsonValue;
        postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOnePublicly(id: string): import("@prisma/client").Prisma.Prisma__FormClient<{
        id: string;
        title: string;
        fields: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue;
        formSettings: import("@prisma/client/runtime/library").JsonValue;
        postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateFormDto: UpdateFormDto, user: DecodedIdToken): Promise<{
        id: string;
        title: string;
        fields: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue;
        formSettings: import("@prisma/client/runtime/library").JsonValue;
        postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    remove(id: string, user: DecodedIdToken): Promise<{
        message: string;
    }>;
    findSubmissions(id: string, user: DecodedIdToken): Promise<{
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
                value: import("@prisma/client/runtime/library").JsonValue;
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
        fields: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue;
        formSettings: import("@prisma/client/runtime/library").JsonValue;
        postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
    }>;
    getIntegrations(id: string, user: DecodedIdToken): never[];
}
