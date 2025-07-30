import { PartialType } from '@nestjs/mapped-types';
import { CreateFormDto } from './create-form.dto';
import * as Joi from 'joi';

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

export class UpdateFormDto extends PartialType(CreateFormDto) {
  static readonly schema = Joi.object({
    title: Joi.string().optional(),
    fields: Joi.array().items(fieldSchema).optional(),
    theme: Joi.object().optional(),
    formSettings: Joi.object().optional(),
    postSubmissionSettings: Joi.object({
      type: Joi.string().valid('message', 'redirect').required(),
      message: Joi.string().when('type', {
        is: 'message',
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
      url: Joi.string().uri().when('type', {
        is: 'redirect',
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    }).optional(),
  });

  formSettings?: any;
  postSubmissionSettings?: any;
}
