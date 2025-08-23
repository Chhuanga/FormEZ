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
                model: 'gemini-2.0-flash',
            });
            const result = await model.generateContent(prompt);
            const response = result.response;
            let text = response.text();
            const jsonObjectMatch = text.match(/\{[\s\S]*\}/s);
            const jsonArrayMatch = text.match(/\[[\s\S]*\]/s);
            if (jsonArrayMatch && jsonArrayMatch[0]) {
                text = jsonArrayMatch[0];
            }
            else if (jsonObjectMatch && jsonObjectMatch[0]) {
                text = jsonObjectMatch[0];
            }
            else {
                const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
                if (markdownMatch && markdownMatch[1]) {
                    text = markdownMatch[1].trim();
                }
                else {
                    const multipleObjectsMatch = text.match(/\{\s*"[\s\S]*\}\s*,[\s\S]*\{\s*"[\s\S]*\}/);
                    if (multipleObjectsMatch) {
                        text = `[${text.trim()}]`;
                    }
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

    If the prompt is specific enough, respond with exactly this: []

    If the prompt is vague, generate a JSON array of 2-3 clarifying questions to help the user. Each question should be an object with an "id" (a machine-friendly string) and a "question" (a user-friendly string).

    Rules for questions:
    - Focus on purpose, audience, and key information to collect.
    - Do NOT ask for field names directly.

    User prompt: "${userPrompt}"

    IMPORTANT: Output ONLY a valid JSON array. Start with [ and end with ]. Do not include any text before or after the JSON.`;
    }
    getFormGenerationPrompt(dto) {
        const answersPart = dto.answers
            ?.map((a) => `- Question: ${a.question}\n  - Answer: ${a.answer}`)
            .join('\n') || 'N/A';
        return `You are an expert form builder assistant. Based on the user's request and their answers to clarifying questions, generate a JSON object containing both a title and form fields.

    The response should be a JSON object with this structure:
    {
      "title": "A descriptive, contextual title for the form",
      "fields": [array of form field objects]
    }

    Rules for the title:
    - Should be professional and descriptive
    - Should reflect the purpose and context of the form
    - Should be concise (3-8 words typically)
    - Should NOT include "AI:" prefix
    - Examples: "Customer Feedback Survey", "Event Registration Form", "Employee Onboarding Form", "Product Review Form"

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

    IMPORTANT: Output ONLY a valid JSON object. Start with { and end with }. Do not include any text before or after the JSON.`;
    }
    async generateForm(dto, user) {
        const prompt = this.getFormGenerationPrompt(dto);
        const rawResponse = await this.callGemini(prompt);
        try {
            const parsed = JSON.parse(rawResponse);
            if (parsed.title && parsed.fields) {
                const response = parsed;
                const newForm = await this.formsService.create({
                    title: response.title,
                    fields: response.fields,
                }, user.uid);
                return { form: newForm };
            }
            if (Array.isArray(parsed)) {
                const generatedFields = parsed;
                const newForm = await this.formsService.create({
                    title: `AI: ${dto.prompt.substring(0, 40)}...`,
                    fields: generatedFields,
                }, user.uid);
                return { form: newForm };
            }
            throw new Error('Unexpected response format from AI');
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
                let parsedQuestions;
                try {
                    parsedQuestions = JSON.parse(rawResponse);
                }
                catch (initialParseError) {
                    const fixedResponse = rawResponse.trim().startsWith('[')
                        ? rawResponse
                        : `[${rawResponse}]`;
                    try {
                        parsedQuestions = JSON.parse(fixedResponse);
                    }
                    catch (secondParseError) {
                        console.error('Failed to parse refinement response as JSON after fixing:', rawResponse, initialParseError);
                        throw new common_1.InternalServerErrorException('AI failed to process the request. Please try again.');
                    }
                }
                if (Array.isArray(parsedQuestions) && parsedQuestions.length === 0) {
                    return this.generateForm(dto, user);
                }
                return { questions: parsedQuestions };
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
    async generateAnalyticsSummary(formData, analyticsData) {
        if (!this.isApiKeyValid) {
            throw new common_1.InternalServerErrorException('AI features are currently unavailable. Please check the server configuration.');
        }
        const prompt = this.getAnalyticsPrompt(formData, analyticsData);
        try {
            const rawResponse = await this.callGemini(prompt);
            const cleanedResponse = this.cleanMarkdownFormatting(rawResponse);
            return cleanedResponse;
        }
        catch (error) {
            console.error('Error generating analytics summary:', error);
            throw new common_1.InternalServerErrorException('Failed to generate analytics summary. Please try again.');
        }
    }
    cleanMarkdownFormatting(text) {
        return (text
            .replace(/```(.*?)```/gs, '$1')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/^\d+\.\s\*\*(.*?)\*\*:/gm, '$1:')
            .replace(/\*\*/g, '')
            .replace(/^#+\s/gm, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim());
    }
    getAnalyticsPrompt(formData, analyticsData) {
        const formTitle = formData?.title || 'Untitled Form';
        const totalSubmissions = analyticsData?.submissionTrend?.reduce((sum, day) => sum + (day?.count || 0), 0) || 0;
        const completionRate = analyticsData?.completionRate
            ? (analyticsData.completionRate * 100).toFixed(1)
            : '0';
        const totalViews = analyticsData?.views || 0;
        const fieldInsights = analyticsData?.fieldAnalytics
            ?.map((field) => {
            const totalResponses = field?.options?.reduce((sum, opt) => sum + (opt?.count || 0), 0) || 0;
            const topResponse = field?.options?.reduce((max, opt) => (opt?.count || 0) > (max?.count || 0) ? opt : max, { option: 'None', count: 0 }) || { option: 'None', count: 0 };
            return `${field?.label || 'Unknown Field'} (${field?.type || 'Unknown'}): ${totalResponses} responses, most popular: "${topResponse?.option || 'None'}" (${topResponse?.count || 0} times)`;
        })
            ?.join('\n') || 'No field analytics available';
        const textInsights = analyticsData?.textAnalytics
            ?.map((field) => {
            const topWords = field?.wordFrequencies
                ?.slice(0, 5)
                ?.map((w) => `"${w?.word || 'unknown'}" (${w?.count || 0})`)
                ?.join(', ') || 'No words';
            return `${field?.label || 'Unknown Field'}: Top words - ${topWords}`;
        })
            ?.join('\n') || 'No text analytics available';
        const trendData = analyticsData?.submissionTrend || [];
        const recentTrend = trendData.slice(-7);
        const avgRecent = recentTrend.reduce((sum, day) => sum + (day?.count || 0), 0) / Math.max(recentTrend.length, 1);
        return `You are an expert data analyst. Analyze the following form analytics data and provide a CONCISE summary with key insights.

Form Information:
- Title: "${formTitle}"
- Total Submissions: ${totalSubmissions}
- Total Views: ${totalViews}
- Completion Rate: ${completionRate}%

Field Analytics:
${fieldInsights}

Text Field Insights:
${textInsights}

Submission Trends:
- Average submissions in last 7 days: ${avgRecent.toFixed(1)}
- Peak day: ${trendData.length > 0
            ? trendData.reduce((max, day) => (day?.count || 0) > (max?.count || 0) ? day : max, { date: 'N/A', count: 0 })?.date || 'N/A'
            : 'N/A'}

Please provide analysis for each section using bullet point format for better readability. Start each section with the section name followed by a colon:

1. Overall Performance Summary: Use 2-3 bullet points focusing on key performance metrics only.

2. Statistical Insights: Use 2-3 bullet points highlighting the most important numbers and what they mean.

3. User Sentiment Analysis: Use 4-5 bullet points covering sentiment patterns and engagement indicators.

4. Response Pattern Analysis: Use 2-3 bullet points covering the main user choice patterns and behaviors.

5. Recommendations: Use 4-5 bullet points with specific, actionable improvements and expected impact.

6. Trends and Patterns: Use 4-5 bullet points covering behavioral insights and patterns from the data.

IMPORTANT FORMATTING RULES:
- Use PLAIN TEXT only - no markdown formatting
- Use simple dashes (-) for bullet points, not asterisks
- Each bullet point should be one clear, complete thought
- Write section names followed by a colon
- Start each bullet point on a new line with "- " 
- Use clear, professional language
- Skip sections if data is insufficient

Return a concise analysis as clean plain text.`;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [forms_service_1.FormsService])
], AiService);
//# sourceMappingURL=ai.service.js.map