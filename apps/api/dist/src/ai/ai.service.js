"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const forms_service_1 = require("../forms/forms.service");
const generative_ai_1 = require("@google/generative-ai");
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
let AiService = class AiService {
    formsService;
    genAI = null;
    isApiKeyValid = false;
    constructor(formsService) {
        this.formsService = formsService;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'placeholder') {
            console.warn('GEMINI_API_KEY is not set or is placeholder - AI features will be disabled');
            this.isApiKeyValid = false;
        }
        else {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.isApiKeyValid = true;
        }
    }
    async callGemini(prompt, retries = 3, delayDuration = 1000) {
        if (!this.isApiKeyValid || !this.genAI) {
            throw new Error('AI service is not available - invalid or missing API key');
        }
        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-1.5-flash-latest',
            });
            const result = await model.generateContent(prompt);
            const response = result.response;
            let text = response.text();
            const jsonMatch = text.match(/\[.*\]/s);
            if (jsonMatch && jsonMatch[0]) {
                text = jsonMatch[0];
            }
            else {
                const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
                if (markdownMatch && markdownMatch[1]) {
                    text = markdownMatch[1];
                }
            }
            return text;
        }
        catch (error) {
            if (retries > 0 &&
                error instanceof Error &&
                error.message.includes('503')) {
                console.log(`Gemini API is overloaded. Retrying in ${delayDuration / 1000}s... (${retries} retries left)`);
                await delay(delayDuration);
                return this.callGemini(prompt, retries - 1, delayDuration * 2);
            }
            console.error('Error calling Gemini API:', error);
            throw new common_1.InternalServerErrorException('Failed to communicate with the AI service.');
        }
    }
    getRefinementPrompt(userPrompt) {
        return `You are a form expert. A user has provided a prompt to create a form. Your first job is to determine if the prompt is too vague. A prompt is vague if it lacks a clear purpose or target audience (e.g., "make a form", "a feedback form"). A prompt is specific if it includes context (e.g., "a feedback form for my coffee shop", "a registration form for a webinar").

    If the prompt is specific enough, respond with an empty JSON array: [].

    If the prompt is vague, generate a JSON array of 2-3 clarifying questions to help the user. Each question should be an object with an "id" (a machine-friendly string) and a "question" (a user-friendly string).

    Rules for questions:
    - Focus on purpose, audience, and key information to collect.
    - Do NOT ask for field names directly.

    User prompt: "${userPrompt}"

    Output only the raw JSON array.`;
    }
    getFormGenerationPrompt(dto) {
        const answersPart = dto.answers
            ?.map((a) => `- Question: ${a.question}\n  - Answer: ${a.answer}`)
            .join('\n') || 'N/A';
        return `You are an expert form builder assistant. Based on the user's request and their answers to clarifying questions, generate a JSON array of form fields.

    Rules for fields:
    - "id" must be a unique, snake_case string.
    - "type" must be one of: "Input", "Textarea", "Email", "RadioGroup", "Select", "Checkbox", "DatePicker", "Number", "FileUpload".
    - "label" must be a user-friendly question.
    - For questions phrased as a "rating from X to Y" or "scale of X to Y", use the "Number" type and set the "validation" property with "min" as X and "max" as Y. For example, "a rating from 1 to 5" should produce: { "type": "Number", "validation": { "min": 1, "max": 5 } }.
    - Set "validation.required" to \`true\` if the user explicitly says a field is "required" or "mandatory", or if it is clearly essential for the form's purpose (like an email in a contact form). Otherwise, default to \`false\`.
    - For "Select", "RadioGroup", or "Checkbox" types, you MUST provide an "options" array. Each item in the array should be an object with a "label" (user-friendly text) and a "value" (a machine-friendly string, e.g., in snake_case).
    - If the user describes a conditional rule (e.g., "If the user selects 'Other', show a text box to specify"), you must implement it using the "conditionalLogic" property on the field that should be shown or hidden.
    - The "conditionalLogic" object should contain:
      - "fieldId": The \`id\` of the field that triggers the logic (e.g., the 'Other' option's field).
      - "operator": The condition to check. Use "equals" or "not_equals".
      - "value": The specific value from the triggering field that activates the logic (e.g., the \`value\` of the 'Other' option).

    Example of a conditional field:
    {
      "id": "specify_other",
      "type": "Input",
      "label": "Please specify",
      "conditionalLogic": {
        "fieldId": "reason_for_contact",
        "operator": "equals",
        "value": "other"
      }
    }

    User Request: "${dto.prompt}"

    Clarifying Answers:
    ${answersPart}

    Output only the raw JSON array.`;
    }
    async generateForm(dto, user) {
        const prompt = this.getFormGenerationPrompt(dto);
        const rawResponse = await this.callGemini(prompt);
        try {
            const generatedFields = JSON.parse(rawResponse);
            const newForm = await this.formsService.create({
                title: `AI: ${dto.prompt.substring(0, 40)}...`,
                fields: generatedFields,
            }, user.uid);
            return { form: newForm };
        }
        catch (parseError) {
            console.error('Failed to parse form generation response as JSON:', rawResponse, parseError);
            throw new common_1.InternalServerErrorException('AI failed to generate a valid form structure. Please try again.');
        }
    }
    async generateFormOrRefinementQuestions(dto, user) {
        if (!this.isApiKeyValid) {
            throw new common_1.InternalServerErrorException('AI features are currently unavailable. Please check the server configuration.');
        }
        try {
            if (dto.answers && dto.answers.length > 0) {
                return this.generateForm(dto, user);
            }
            const refinementPrompt = this.getRefinementPrompt(dto.prompt);
            const rawResponse = await this.callGemini(refinementPrompt);
            try {
                const questions = JSON.parse(rawResponse);
                if (Array.isArray(questions) && questions.length === 0) {
                    return this.generateForm(dto, user);
                }
                return { questions };
            }
            catch (parseError) {
                console.error('Failed to parse refinement response as JSON:', rawResponse, parseError);
                throw new common_1.InternalServerErrorException('AI failed to process the request. Please try again.');
            }
        }
        catch (error) {
            if (error instanceof Error &&
                error.message?.includes('AI service is not available')) {
                throw new common_1.InternalServerErrorException('AI features are temporarily unavailable. Please try again later.');
            }
            throw error;
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [forms_service_1.FormsService])
], AiService);
//# sourceMappingURL=ai.service.js.map