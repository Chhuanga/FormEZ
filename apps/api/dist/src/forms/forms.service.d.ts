import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class FormsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createFormDto: CreateFormDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        userId: string;
    }>;
    logFormView(formId: string): Promise<void>;
    findAll(userId: string): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        userId: string;
    }[]>;
    findOne(id: string, userId: string): Prisma.Prisma__FormClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        userId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findOnePublicly(id: string): Prisma.Prisma__FormClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        userId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, userId: string, updateFormDto: UpdateFormDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        userId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
