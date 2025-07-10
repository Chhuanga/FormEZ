import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class FormsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createFormDto: CreateFormDto, userId: string): Promise<{
        title: string;
        id: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    logFormView(formId: string): Promise<void>;
    findAll(userId: string): Prisma.PrismaPromise<{
        title: string;
        id: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    findOne(id: string, userId: string): Prisma.Prisma__FormClient<{
        title: string;
        id: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findOnePublicly(id: string): Prisma.Prisma__FormClient<{
        title: string;
        id: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, userId: string, updateFormDto: UpdateFormDto): Promise<{
        title: string;
        id: string;
        fields: Prisma.JsonValue;
        theme: Prisma.JsonValue;
        postSubmissionSettings: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
