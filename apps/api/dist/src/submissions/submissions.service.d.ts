import { PrismaService } from '../prisma/prisma.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
export declare class SubmissionsService {
    private prisma;
    private integrationsService;
    constructor(prisma: PrismaService, integrationsService: IntegrationsService);
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
    }>;
    findByFormId(formId: string, userId: string): Promise<{
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
                value: import("@prisma/client/runtime/library").JsonValue;
                id: string;
                fieldId: string;
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
    getAnalyticsByFormId(formId: string, userId: string, dateRange?: {
        from: string;
        to: string;
    }): Promise<{
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
    private _calculateNumericStats;
    findOne(submissionId: string, userId: string): Promise<{
        form: {
            title: string;
            fields: import("@prisma/client/runtime/library").JsonValue;
            userId: string | null;
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
    }>;
}
