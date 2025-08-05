import { PrismaService } from '../prisma/prisma.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { AiService } from '../ai/ai.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
export declare class SubmissionsService {
    private prisma;
    private integrationsService;
    private aiService;
    constructor(prisma: PrismaService, integrationsService: IntegrationsService, aiService: AiService);
    create(formId: string, createSubmissionDto: CreateSubmissionDto): Promise<any>;
    findByFormId(formId: string, userId: string): Promise<{
        form: {
            id: any;
            title: any;
            fields: any;
        };
        submissions: any;
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
    getAiAnalyticsSummary(formId: string, userId: string, dateRange?: {
        from: string;
        to: string;
    }): Promise<{
        summary: string;
        generatedAt: string;
        formId: string;
        dateRange: {
            from: string;
            to: string;
        } | undefined;
    }>;
    private _calculateNumericStats;
    findOne(submissionId: string, userId: string): Promise<any>;
}
