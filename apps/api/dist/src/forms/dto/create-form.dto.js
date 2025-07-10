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
exports.CreateFormDto = void 0;
const Joi = require("joi");
const class_validator_1 = require("class-validator");
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
class CreateFormDto {
    title;
    fields;
    theme;
    postSubmissionSettings;
    static schema = Joi.object({
        title: Joi.string().required(),
        fields: Joi.array().items(fieldSchema).optional(),
        theme: Joi.object().optional(),
        postSubmissionSettings: Joi.object().optional(),
    });
}
exports.CreateFormDto = CreateFormDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFormDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateFormDto.prototype, "fields", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateFormDto.prototype, "theme", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateFormDto.prototype, "postSubmissionSettings", void 0);
//# sourceMappingURL=create-form.dto.js.map