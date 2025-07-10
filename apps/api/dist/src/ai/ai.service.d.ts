import { FormsService } from '../forms/forms.service';
import { DecodedIdToken } from 'firebase-admin/auth';
export declare class AiService {
    private readonly formsService;
    constructor(formsService: FormsService);
    generateFormFromPrompt(prompt: string, user: DecodedIdToken): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fields: import("@prisma/client/runtime/library").JsonValue;
        theme: import("@prisma/client/runtime/library").JsonValue;
        postSubmissionSettings: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
    }>;
}
