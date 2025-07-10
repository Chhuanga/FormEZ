import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateFormWithAiDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
