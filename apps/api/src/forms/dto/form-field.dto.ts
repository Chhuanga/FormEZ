import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class FieldValidationDto {
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsNumber()
  @IsOptional()
  min?: number;

  @IsNumber()
  @IsOptional()
  max?: number;

  @IsNumber()
  @IsOptional()
  minLength?: number;

  @IsNumber()
  @IsOptional()
  maxLength?: number;
}

class OptionDto {
  @IsString()
  label: string;

  @IsString()
  value: string;
}

export class FormFieldDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => FieldValidationDto)
  validation?: FieldValidationDto;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: (string | OptionDto)[];
}
