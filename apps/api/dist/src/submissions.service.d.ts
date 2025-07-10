import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
import { CreateSubmissionDto } from './submissions/dto/create-submission.dto';
export declare class SubmissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(formId: string, createSubmissionDto: CreateSubmissionDto): Promise<{
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
            fieldId: string;
            value: Prisma.JsonValue;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            submissionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        formId: string;
    }>;
    findByFormId(formId: string, userId: string): Promise<{
        form: {
            id: string;
            title: string;
            fields: Prisma.JsonValue;
        };
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
                fieldId: string;
                value: Prisma.JsonValue;
                id: string;
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
    }>;
    getAnalyticsByFormId(formId: string, userId: string): Promise<{
        submissionTrend: {
            date: string;
            count: number;
        }[];
        fieldAnalytics: {
            fieldId: any;
            label: any;
            type: any;
            options: {
                option: string;
                count: number;
            }[];
        }[];
    }>;
    findOne(submissionId: string, userId: string): Promise<{
        form: {
            title: string;
            fields: Prisma.JsonValue;
            userId: string;
        };
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
            fieldId: string;
            value: Prisma.JsonValue;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            submissionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        formId: string;
    }>;
}
