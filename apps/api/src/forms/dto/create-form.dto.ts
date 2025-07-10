import * as Joi from 'joi';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { FormFieldDto } from './form-field.dto';
import { Type } from 'class-transformer';

const conditionalLogicSchema = Joi.object({
  fieldId: Joi.string().required(),
  operator: Joi.string().required(),
  value: Joi.any().required(),
});

const fieldSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().required(),
  label: Joi.string().required(),
  placeholder: Joi.string().optional().allow(''),
  validation: Joi.object({
    required: Joi.boolean().optional(),
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    minLength: Joi.number().optional(),
    maxLength: Joi.number().optional(),
  }).optional(),
  options: Joi.array()
    .items(
      Joi.alternatives().try(
        Joi.string(),
        Joi.object({
          label: Joi.string().required(),
          value: Joi.string().required(),
        }),
      ),
    )
    .optional(),
  conditionalLogic: conditionalLogicSchema.optional().allow(null),
});

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];

  @IsObject()
  @IsOptional()
  theme?: any;

  @IsObject()
  @IsOptional()
  postSubmissionSettings?: any;

  static readonly schema = Joi.object({
    title: Joi.string().required(),
    fields: Joi.array().items(fieldSchema).optional(),
    theme: Joi.object().optional(),
    postSubmissionSettings: Joi.object().optional(),
  });
}
