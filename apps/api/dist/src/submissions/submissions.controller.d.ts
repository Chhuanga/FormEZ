import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { DecodedIdToken } from 'firebase-admin/auth';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    create(formId: string, createSubmissionDto: CreateSubmissionDto): Promise<any>;
    findByFormId(formId: string, req: {
        user: {
            uid: string;
        };
    }): Promise<{
        form: {
            id: any;
            title: any;
            fields: any;
        };
        submissions: any;
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
    getAiAnalyticsSummary(formId: string, user: DecodedIdToken, from?: string, to?: string): Promise<{
        summary: string;
        generatedAt: string;
        formId: string;
        dateRange: {
            from: string;
            to: string;
        } | undefined;
    }>;
    findOne(submissionId: string, req: {
        user: {
            uid: string;
        };
    }): Promise<any>;
}
