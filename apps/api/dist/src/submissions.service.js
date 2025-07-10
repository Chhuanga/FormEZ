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
exports.SubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
let SubmissionsService = class SubmissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(formId, createSubmissionDto) {
        const form = await this.prisma.form.findUnique({
            where: { id: formId },
        });
        if (!form) {
            throw new common_1.NotFoundException('Form not found');
        }
        const formFields = form.fields;
        const { answers } = createSubmissionDto;
        for (const field of formFields) {
            if (field.validation?.required) {
                const answer = answers[field.id];
                if (!answer ||
                    answer.value === null ||
                    answer.value === undefined ||
                    answer.value === '' ||
                    (Array.isArray(answer.value) && answer.value.length === 0)) {
                    throw new common_1.BadRequestException(`${field.label} is a required field.`);
                }
            }
        }
        const submission = await this.prisma.formSubmission.create({
            data: {
                formId,
                answers: {
                    create: Object.entries(answers).map(([fieldId, answer]) => {
                        return {
                            fieldId,
                            value: answer.value,
                        };
                    }),
                },
            },
            include: {
                answers: {
                    include: {
                        file: true,
                    },
                },
            },
        });
        return submission;
    }
    async findByFormId(formId, userId) {
        const form = await this.prisma.form.findUnique({
            where: { id: formId, userId },
            include: {
                submissions: {
                    include: {
                        answers: {
                            include: {
                                file: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!form) {
            throw new common_1.NotFoundException('Form not found or you do not have permission to view its submissions');
        }
        return {
            form: {
                id: form.id,
                title: form.title,
                fields: form.fields,
            },
            submissions: form.submissions,
        };
    }
    async getAnalyticsByFormId(formId, userId) {
        const form = await this.prisma.form.findUnique({
            where: { id: formId, userId },
            include: {
                submissions: {
                    include: {
                        answers: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
        if (!form) {
            throw new common_1.NotFoundException('Form not found or you do not have permission to view its analytics');
        }
        const submissionTrend = form.submissions.reduce((acc, submission) => {
            const date = submission.createdAt.toISOString().split('T')[0];
            const existing = acc.find((item) => item.date === date);
            if (existing) {
                existing.count++;
            }
            else {
                acc.push({ date, count: 1 });
            }
            return acc;
        }, []);
        const formFields = form.fields.filter((field) => field.type === 'RadioGroup' ||
            field.type === 'Select' ||
            field.type === 'Checkbox');
        const fieldAnalytics = formFields.map((field) => {
            const counts = {};
            if (field.options) {
                field.options.forEach((option) => {
                    counts[option] = 0;
                });
            }
            for (const submission of form.submissions) {
                const answer = submission.answers.find((a) => a.fieldId === field.id);
                if (answer && answer.value) {
                    const value = answer.value;
                    if (Array.isArray(value)) {
                        for (const option of value) {
                            if (typeof option === 'string' && option in counts) {
                                counts[option]++;
                            }
                        }
                    }
                    else if (typeof value === 'string') {
                        if (value in counts) {
                            counts[value]++;
                        }
                    }
                }
            }
            return {
                fieldId: field.id,
                label: field.label,
                type: field.type,
                options: Object.entries(counts).map(([option, count]) => ({
                    option,
                    count,
                })),
            };
        });
        return {
            submissionTrend,
            fieldAnalytics,
        };
    }
    async findOne(submissionId, userId) {
        const submission = await this.prisma.formSubmission.findUnique({
            where: { id: submissionId },
            include: {
                form: {
                    select: {
                        userId: true,
                        title: true,
                        fields: true,
                    },
                },
                answers: {
                    include: {
                        file: true,
                    },
                },
            },
        });
        if (!submission) {
            throw new common_1.NotFoundException('Submission not found');
        }
        if (submission.form.userId !== userId) {
            throw new common_1.NotFoundException('Submission not found or you do not have permission to view it');
        }
        return submission;
    }
};
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map