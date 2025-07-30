declare class AnswerDto {
    question: string;
    answer: string;
}
export declare class GenerateFormWithAiDto {
    prompt: string;
    answers?: AnswerDto[];
}
export {};
