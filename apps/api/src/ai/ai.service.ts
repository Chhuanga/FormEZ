import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FormsService } from '../forms/forms.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { FormFieldDto } from '../forms/dto/form-field.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateFormWithAiDto } from './dto/generate-form-with-ai.dto';
import { RefinementQuestion } from './dto/refinement-question.dto';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI | null = null;
  private isApiKeyValid: boolean = false;

  constructor(private readonly formsService: FormsService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'placeholder') {
      console.warn(
        'GEMINI_API_KEY is not set or is placeholder - AI features will be disabled',
      );
      this.isApiKeyValid = false;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.isApiKeyValid = true;
    }
  }

  private async callGemini(
    prompt: string,
    retries = 3,
    delayDuration = 1000,
  ): Promise<string> {
    if (!this.isApiKeyValid || !this.genAI) {
      throw new Error(
        'AI service is not available - invalid or missing API key',
      );
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
      });
      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text();

      // Try to extract JSON object or array from the response
      const jsonObjectMatch = text.match(/\{[\s\S]*\}/s);
      const jsonArrayMatch = text.match(/\[[\s\S]*\]/s);
      
      if (jsonObjectMatch && jsonObjectMatch[0]) {
        text = jsonObjectMatch[0];
      } else if (jsonArrayMatch && jsonArrayMatch[0]) {
        text = jsonArrayMatch[0];
      } else {
        const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
          text = markdownMatch[1];
        }
      }
      return text;
    } catch (error) {
      if (
        retries > 0 &&
        error instanceof Error &&
        error.message.includes('503')
      ) {
        console.log(
          `Gemini API is overloaded. Retrying in ${
            delayDuration / 1000
          }s... (${retries} retries left)`,
        );
        await delay(delayDuration);
        return this.callGemini(prompt, retries - 1, delayDuration * 2);
      }

      console.error('Error calling Gemini API:', error);
      throw new InternalServerErrorException(
        'Failed to communicate with the AI service.',
      );
    }
  }

  private getRefinementPrompt(userPrompt: string): string {
    return `You are a form expert. A user has provided a prompt to create a form. Your first job is to determine if the prompt is too vague. A prompt is vague if it lacks a clear purpose or target audience (e.g., "make a form", "a feedback form"). A prompt is specific if it includes context (e.g., "a feedback form for my coffee shop", "a registration form for a webinar").

    If the prompt is specific enough, respond with an empty JSON array: [].

    If the prompt is vague, generate a JSON array of 2-3 clarifying questions to help the user. Each question should be an object with an "id" (a machine-friendly string) and a "question" (a user-friendly string).

    Rules for questions:
    - Focus on purpose, audience, and key information to collect.
    - Do NOT ask for field names directly.

    User prompt: "${userPrompt}"

    Output only the raw JSON array.`;
  }

  private getFormGenerationPrompt(dto: GenerateFormWithAiDto): string {
    const answersPart =
      dto.answers
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

    Output only the raw JSON object with title and fields.`;
  }

  private async generateForm(dto: GenerateFormWithAiDto, user: DecodedIdToken) {
    const prompt = this.getFormGenerationPrompt(dto);
    const rawResponse = await this.callGemini(prompt);

    try {
      const parsed = JSON.parse(rawResponse);
      
      // Handle new format (object with title and fields)
      if (parsed.title && parsed.fields) {
        const response = parsed as {
          title: string;
          fields: FormFieldDto[];
        };
        
        const newForm = await this.formsService.create(
          {
            title: response.title,
            fields: response.fields,
          },
          user.uid,
        );
        return { form: newForm };
      }
      
      // Handle old format (just array of fields) - fallback
      if (Array.isArray(parsed)) {
        const generatedFields = parsed as FormFieldDto[];
        const newForm = await this.formsService.create(
          {
            title: `AI: ${dto.prompt.substring(0, 40)}...`,
            fields: generatedFields,
          },
          user.uid,
        );
        return { form: newForm };
      }
      
      throw new Error('Unexpected response format from AI');
    } catch (parseError) {
      console.error(
        'Failed to parse form generation response as JSON:',
        rawResponse,
        parseError,
      );
      throw new InternalServerErrorException(
        'AI failed to generate a valid form structure. Please try again.',
      );
    }
  }

  async generateFormOrRefinementQuestions(
    dto: GenerateFormWithAiDto,
    user: DecodedIdToken,
  ) {
    if (!this.isApiKeyValid) {
      throw new InternalServerErrorException(
        'AI features are currently unavailable. Please check the server configuration.',
      );
    }

    try {
      if (dto.answers && dto.answers.length > 0) {
        return this.generateForm(dto, user);
      }

      const refinementPrompt = this.getRefinementPrompt(dto.prompt);
      const rawResponse = await this.callGemini(refinementPrompt);

      try {
        const questions = JSON.parse(rawResponse) as RefinementQuestion[];
        if (Array.isArray(questions) && questions.length === 0) {
          // AI deemed the prompt specific enough, proceed to form generation
          return this.generateForm(dto, user);
        }
        return { questions };
      } catch (parseError) {
        console.error(
          'Failed to parse refinement response as JSON:',
          rawResponse,
          parseError,
        );
        throw new InternalServerErrorException(
          'AI failed to process the request. Please try again.',
        );
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message?.includes('AI service is not available')
      ) {
        throw new InternalServerErrorException(
          'AI features are temporarily unavailable. Please try again later.',
        );
      }
      // Re-throw other errors as-is
      throw error;
    }
  }

  async generateAnalyticsSummary(
    formData: any,
    analyticsData: any,
  ): Promise<string> {
    if (!this.isApiKeyValid) {
      throw new InternalServerErrorException(
        'AI features are currently unavailable. Please check the server configuration.',
      );
    }

    const prompt = this.getAnalyticsPrompt(formData, analyticsData);
    
    try {
      const rawResponse = await this.callGemini(prompt);
      // Clean the response to remove markdown formatting
      const cleanedResponse = this.cleanMarkdownFormatting(rawResponse);
      return cleanedResponse;
    } catch (error) {
      console.error('Error generating analytics summary:', error);
      throw new InternalServerErrorException(
        'Failed to generate analytics summary. Please try again.',
      );
    }
  }

  private cleanMarkdownFormatting(text: string): string {
    return (
      text
        // Remove code blocks
        .replace(/```(.*?)```/gs, '$1')
        // Remove bold formatting
        .replace(/\*\*(.*?)\*\*/g, '$1')
        // Remove italic formatting
        .replace(/\*(.*?)\*/g, '$1')
        // Remove numbered list markdown
        .replace(/^\d+\.\s\*\*(.*?)\*\*:/gm, '$1:')
        // Remove any remaining **
        .replace(/\*\*/g, '')
        // Remove markdown headers
        .replace(/^#+\s/gm, '')
        // Clean up extra whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    );
  }

  private getAnalyticsPrompt(formData: any, analyticsData: any): string {
    const formTitle = (formData?.title as string) || 'Untitled Form';
    const totalSubmissions = analyticsData?.submissionTrend?.reduce(
      (sum: number, day: any) => sum + (day?.count || 0),
      0,
    ) || 0;
    const completionRate = analyticsData?.completionRate
      ? (analyticsData.completionRate * 100).toFixed(1)
      : '0';
    const totalViews = analyticsData?.views || 0;

    // Prepare field analytics summary
    const fieldInsights =
      analyticsData?.fieldAnalytics
        ?.map((field: any) => {
          const totalResponses = field?.options?.reduce(
            (sum: number, opt: any) => sum + (opt?.count || 0),
            0,
          ) || 0;
          const topResponse = field?.options?.reduce(
            (max: any, opt: any) =>
              (opt?.count || 0) > (max?.count || 0) ? opt : max,
            { option: 'None', count: 0 },
          ) || { option: 'None', count: 0 };
          return `${field?.label || 'Unknown Field'} (${field?.type || 'Unknown'}): ${totalResponses} responses, most popular: "${topResponse?.option || 'None'}" (${topResponse?.count || 0} times)`;
        })
        ?.join('\n') || 'No field analytics available';

    // Prepare text analytics insights
    const textInsights =
      analyticsData?.textAnalytics
        ?.map((field: any) => {
          const topWords =
            field?.wordFrequencies
              ?.slice(0, 5)
              ?.map((w: any) => `"${w?.word || 'unknown'}" (${w?.count || 0})`)
              ?.join(', ') || 'No words';
          return `${field?.label || 'Unknown Field'}: Top words - ${topWords}`;
        })
        ?.join('\n') || 'No text analytics available';

    // Submission trend analysis
    const trendData = analyticsData?.submissionTrend || [];
    const recentTrend = trendData.slice(-7); // Last 7 days
    const avgRecent =
      recentTrend.reduce(
        (sum: number, day: any) => sum + (day?.count || 0),
        0,
      ) / Math.max(recentTrend.length, 1);

    return `You are an expert data analyst and user experience researcher. Analyze the following form analytics data and provide a comprehensive summary with insights and sentiment analysis.

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
- Peak day: ${
      trendData.length > 0
        ? trendData.reduce(
            (max: any, day: any) =>
              (day?.count || 0) > (max?.count || 0) ? day : max,
            { date: 'N/A', count: 0 },
          )?.date || 'N/A'
        : 'N/A'
    }

Please provide a comprehensive analysis that includes the following sections. For each section, start with the section name followed by a colon, then provide the analysis in clear, professional language:

1. Overall Performance Summary: How is the form performing in terms of engagement and completion?

2. Statistical Insights: Key metrics and what they indicate about user behavior.

3. User Sentiment Analysis: Based on the response patterns and text analysis, what can you infer about user sentiment and satisfaction?

4. Response Pattern Analysis: What do the choice field responses tell us about user preferences and behavior?

5. Recommendations: Specific actionable suggestions to improve form performance, user experience, or data collection.

6. Trends and Patterns: What temporal patterns or behavioral insights can you identify?

IMPORTANT FORMATTING RULES:
- Use PLAIN TEXT only - no markdown formatting
- Do NOT use asterisks (*) or any other markdown symbols
- Do NOT use bold (**text**) or italic (*text*) formatting
- Simply write section names followed by a colon
- Write in clear, professional language as if presenting to a business stakeholder
- Focus on actionable insights and avoid overly technical jargon
- If data is limited, acknowledge this and suggest ways to gather more meaningful insights
- Use simple paragraph breaks for readability

Return the analysis as clean plain text without any formatting symbols.`;
  }
}
