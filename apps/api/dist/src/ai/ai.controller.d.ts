import { AiService } from './ai.service';
import { GenerateFormWithAiDto } from './dto/generate-form-with-ai.dto';
import { DecodedIdToken } from 'firebase-admin/auth';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    generateForm(body: GenerateFormWithAiDto, user: DecodedIdToken): Promise<{
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
        questions: import("./dto/refinement-question.dto").RefinementQuestion[];
    }>;
}
