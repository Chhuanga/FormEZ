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
exports.FormsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const integrations_service_1 = require("../integrations/integrations.service");
let FormsService = class FormsService {
    prisma;
    integrationsService;
    constructor(prisma, integrationsService) {
        this.prisma = prisma;
        this.integrationsService = integrationsService;
    }
    async create(createFormDto, userId) {
        await this.prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId },
        });
        return this.prisma.form.create({
            data: {
                title: createFormDto.title,
                fields: createFormDto.fields || [],
                theme: createFormDto.theme || {},
                postSubmissionSettings: createFormDto.postSubmissionSettings ||
                    undefined,
                userId,
            },
        });
    }
    async logFormView(formId) {
        const form = await this.prisma.form.findUnique({
            where: { id: formId },
            select: { id: true },
        });
        if (!form) {
            console.warn(`Attempted to log a view for a non-existent form: ${formId}`);
            return;
        }
        await this.prisma.formView.create({
            data: {
                formId: formId,
            },
        });
    }
    findAll(userId) {
        return this.prisma.form.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }
    findOne(id, userId) {
        return this.prisma.form.findUnique({
            where: { id, userId },
        });
    }
    findOnePublicly(id) {
        return this.prisma.form.findUnique({
            where: { id },
        });
    }
    async update(id, userId, updateFormDto) {
        const form = await this.prisma.form.findUnique({
            where: { id, userId },
        });
        if (!form) {
            throw new Error('Form not found or you do not have permission to edit it.');
        }
        return this.prisma.form.update({
            where: { id },
            data: {
                title: updateFormDto.title,
                fields: updateFormDto.fields,
                theme: updateFormDto.theme,
                postSubmissionSettings: updateFormDto.postSubmissionSettings ||
                    undefined,
            },
        });
    }
    async remove(id, userId) {
        const form = await this.prisma.form.findUnique({
            where: { id, userId },
        });
        if (!form) {
            throw new Error('Form not found or you do not have permission to delete it.');
        }
        await this.prisma.$transaction(async (prisma) => {
            const submissions = await prisma.formSubmission.findMany({
                where: { formId: id },
                select: { id: true },
            });
            if (submissions.length > 0) {
                const submissionIds = submissions.map((s) => s.id);
                await prisma.file.deleteMany({
                    where: {
                        answer: {
                            submissionId: { in: submissionIds },
                        },
                    },
                });
                await prisma.answer.deleteMany({
                    where: {
                        submissionId: { in: submissionIds },
                    },
                });
                await prisma.formSubmission.deleteMany({
                    where: { formId: id },
                });
            }
            await prisma.formView.deleteMany({
                where: { formId: id },
            });
            await prisma.form.delete({
                where: { id },
            });
        });
        return { message: 'Form deleted successfully' };
    }
    async findSubmissions(formId, userId) {
        const form = await this.prisma.form.findUnique({
            where: { id: formId, userId: userId },
            include: {
                submissions: {
                    include: {
                        answers: {
                            include: {
                                file: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!form) {
            throw new common_1.NotFoundException('Form not found or you do not have permission to view its submissions.');
        }
        return form;
    }
    getIntegrations(formId, userId) {
        return this.integrationsService.findAllByFormId(formId, userId);
    }
};
exports.FormsService = FormsService;
exports.FormsService = FormsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        integrations_service_1.IntegrationsService])
], FormsService);
//# sourceMappingURL=forms.service.js.map