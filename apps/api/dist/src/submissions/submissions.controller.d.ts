import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { DecodedIdToken } from 'firebase-admin/auth';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
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
            value: import("@prisma/client/runtime/library").JsonValue;
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
    findByFormId(formId: string, req: {
        user: {
            uid: string;
        };
    }): Promise<{
        form: {
            id: string;
            title: string;
            fields: import("@prisma/client/runtime/library").JsonValue;
        };
        submissions: {
            answers: {
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
                fieldId: string;
                value: import("@prisma/client/runtime/library").JsonValue;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                submissionId: string;
            }[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            formId: string;
        }[];
    }>;
    getAnalytics(formId: string, user: DecodedIdToken, from?: string, to?: string): Promise<{
        submissionTrend: {
            date: string;
            count: number;
        }[];
        submissionsByDayOfWeek: any[];
        submissionsByHourOfDay: any[];
        fieldAnalytics: {
            fieldId: string;
            label: string;
            type: string;
            options: {
                option: string;
                count: number;
            }[];
        }[];
        textAnalytics: {
            fieldId: string;
            label: string;
            type: string;
            wordFrequencies: {
                word: string;
                count: number;
            }[];
        }[];
        numericAnalytics: {
            fieldId: string;
            label: string;
            type: string;
            stats: {
                count: number;
                sum: number;
                mean: number;
                min: number;
                max: number;
                histogram: {
                    bin: string;
                    count: number;
                }[];
            };
        }[];
        views: number;
        completionRate: number;
        funnel: {
            views: number;
            submissions: number;
        };
    }>;
    findOne(submissionId: string, req: {
        user: {
            uid: string;
        };
    }): Promise<{
        form: {
            title: string;
            fields: import("@prisma/client/runtime/library").JsonValue;
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
            value: import("@prisma/client/runtime/library").JsonValue;
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
