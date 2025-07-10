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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const forms_service_1 = require("../forms/forms.service");
let AiService = class AiService {
    formsService;
    constructor(formsService) {
        this.formsService = formsService;
    }
    async generateFormFromPrompt(prompt, user) {
        const mockGeneratedFields = [
            {
                id: 'full_name',
                type: 'Text',
                label: 'Full Name',
                validation: { required: true },
            },
            {
                id: 'email_address',
                type: 'Email',
                label: 'Email Address',
                validation: { required: true },
            },
            {
                id: 'feedback_topic',
                type: 'RadioGroup',
                label: 'What is your feedback about?',
                options: ['The course content', 'The instructor', 'The platform'],
                validation: { required: true },
            },
            {
                id: 'feedback_message',
                type: 'Textarea',
                label: 'Your Message',
                validation: { required: false },
            },
        ];
        const newForm = await this.formsService.create({
            title: `AI: ${prompt.substring(0, 40)}...`,
            fields: mockGeneratedFields,
        }, user.uid);
        return newForm;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [forms_service_1.FormsService])
], AiService);
//# sourceMappingURL=ai.service.js.map