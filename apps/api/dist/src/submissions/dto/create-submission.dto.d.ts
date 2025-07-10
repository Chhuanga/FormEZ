import { Prisma } from '@prisma/client';
export declare class AnswerDto {
    value: Prisma.JsonValue;
    file?: Express.Multer.File;
}
export declare class CreateSubmissionDto {
    answers: Record<string, AnswerDto>;
}
