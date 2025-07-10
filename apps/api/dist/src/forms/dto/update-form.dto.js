"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFormDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_form_dto_1 = require("./create-form.dto");
const Joi = require("joi");
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
    options: Joi.array().items(Joi.string()).optional(),
    conditionalLogic: conditionalLogicSchema.optional().allow(null),
});
class UpdateFormDto extends (0, mapped_types_1.PartialType)(create_form_dto_1.CreateFormDto) {
    static schema = Joi.object({
        title: Joi.string().optional(),
        fields: Joi.array().items(fieldSchema).optional(),
        theme: Joi.object().optional(),
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
    postSubmissionSettings;
}
exports.UpdateFormDto = UpdateFormDto;
//# sourceMappingURL=update-form.dto.js.map