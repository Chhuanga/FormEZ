import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { DecodedIdToken } from 'firebase-admin/auth';
export declare class FormsController {
    private readonly formsService;
    constructor(formsService: FormsService);
    create(createFormDto: CreateFormDto, user: DecodedIdToken): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fields: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue;
        postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
    }>;
    logFormView(id: string): void;
    findAll(user: DecodedIdToken): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fields: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue;
        postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
    }[]>;
    findOne(id: string, user: DecodedIdToken): import("@prisma/client").Prisma.Prisma__FormClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fields: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue;
        postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOnePublicly(id: string): import("@prisma/client").Prisma.Prisma__FormClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fields: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue;
        postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateFormDto: UpdateFormDto, user: DecodedIdToken): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fields: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue;
        postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
    }>;
    remove(id: string, user: DecodedIdToken): Promise<{
        message: string;
    }>;
}
