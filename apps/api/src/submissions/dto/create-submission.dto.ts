import { Prisma } from '@prisma/client';

export class AnswerDto {
  value: Prisma.JsonValue;
  file?: Express.Multer.File;
}

export class CreateSubmissionDto {
  answers: Record<string, AnswerDto>;
}
