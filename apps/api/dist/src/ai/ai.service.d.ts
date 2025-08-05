import { FormsService } from '../forms/forms.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { GenerateFormWithAiDto } from './dto/generate-form-with-ai.dto';
import { RefinementQuestion } from './dto/refinement-question.dto';
export declare class AiService {
    private readonly formsService;
    private genAI;
    private isApiKeyValid;
    constructor(formsService: FormsService);
    private callGemini;
    private getRefinementPrompt;
    private getFormGenerationPrompt;
    private generateForm;
    generateFormOrRefinementQuestions(dto: GenerateFormWithAiDto, user: DecodedIdToken): Promise<{
        form: {
            id: string;
            title: string;
            fields: import("@prisma/client/runtime/library").JsonValue;
            theme: import("@prisma/client/runtime/library").JsonValue;
            formSettings: import("@prisma/client/runtime/library").JsonValue;
            postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
        };
    } | {
        questions: RefinementQuestion[];
    }>;
    generateAnalyticsSummary(formData: any, analyticsData: any): Promise<string>;
    private cleanMarkdownFormatting;
    private getAnalyticsPrompt;
}
