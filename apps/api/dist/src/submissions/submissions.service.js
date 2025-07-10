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
const prisma_service_1 = require("../prisma/prisma.service");
const integrations_service_1 = require("../integrations/integrations.service");
const STOP_WORDS = new Set([
    'a',
    'an',
    'the',
    'is',
    'in',
    'it',
    'of',
    'for',
    'on',
    'with',
    'at',
    'by',
    'to',
    'from',
    'and',
    'or',
    'but',
    'so',
    'if',
    'i',
    'you',
    'he',
    'she',
    'we',
    'they',
    'me',
    'him',
    'her',
    'us',
    'them',
    'my',
    'your',
    'his',
    'its',
    'our',
    'their',
    'was',
    'were',
    'be',
    'been',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'should',
    'can',
    'could',
    'not',
    'this',
    'that',
    'these',
    'those',
    'am',
    'are',
    'is',
    'what',
    'which',
    'who',
    'whom',
    'where',
    'when',
    'why',
    'how',
]);
let SubmissionsService = class SubmissionsService {
    prisma;
    integrationsService;
    constructor(prisma, integrationsService) {
        this.prisma = prisma;
        this.integrationsService = integrationsService;
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
        this.integrationsService.onFormSubmission(formId, submission);
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
            submissions: form.submissions.map((s) => ({
                ...s,
                answers: s.answers.map((a) => ({
                    ...a,
                    file: a.file || null,
                })),
            })),
        };
    }
    async getAnalyticsByFormId(formId, userId, dateRange) {
        const dateFilter = {};
        if (dateRange?.from) {
            dateFilter.gte = new Date(dateRange.from);
        }
        if (dateRange?.to) {
            dateFilter.lte = new Date(dateRange.to);
        }
        const form = (await this.prisma.form.findUnique({
            where: { id: formId, userId },
            include: {
                submissions: {
                    where: { createdAt: dateFilter },
                    include: { answers: true },
                    orderBy: { createdAt: 'asc' },
                },
                views: {
                    where: { createdAt: dateFilter },
                },
            },
        }));
        if (!form) {
            throw new common_1.NotFoundException('Form not found or you do not have permission to view its analytics');
        }
        const totalViews = form.views.length;
        const totalSubmissions = form.submissions.length;
        const completionRate = totalViews > 0 ? totalSubmissions / totalViews : 0;
        const formFields = form.fields;
        const fieldMap = new Map(formFields.map((field) => [field.id, field]));
        const trend = new Map();
        const byDayOfWeek = Array(7).fill(0);
        const byHourOfDay = Array(24).fill(0);
        const choiceFieldAnalytics = new Map();
        const textFieldAnalytics = new Map();
        const numericFieldAnalytics = new Map();
        formFields.forEach((field) => {
            if (['RadioGroup', 'Select', 'Checkbox'].includes(field.type)) {
                const counts = new Map();
                field.options?.forEach((option) => counts.set(option, 0));
                choiceFieldAnalytics.set(field.id, counts);
            }
            else if (['Input', 'Textarea', 'Email'].includes(field.type)) {
                textFieldAnalytics.set(field.id, new Map());
            }
            else if (field.type === 'NumberInput') {
                numericFieldAnalytics.set(field.id, []);
            }
        });
        form.submissions.forEach((submission) => {
            const date = new Date(submission.createdAt);
            const dateString = date.toISOString().split('T')[0];
            trend.set(dateString, (trend.get(dateString) || 0) + 1);
            byDayOfWeek[date.getDay()]++;
            byHourOfDay[date.getHours()]++;
            submission.answers.forEach((answer) => {
                const field = fieldMap.get(answer.fieldId);
                if (!field || !answer.value)
                    return;
                if (choiceFieldAnalytics.has(field.id)) {
                    const answerValues = Array.isArray(answer.value)
                        ? answer.value
                        : [answer.value];
                    const counts = choiceFieldAnalytics.get(field.id);
                    answerValues.forEach((value) => {
                        if (counts.has(value)) {
                            counts.set(value, counts.get(value) + 1);
                        }
                    });
                }
                else if (textFieldAnalytics.has(field.id) &&
                    typeof answer.value === 'string') {
                    const wordCounts = textFieldAnalytics.get(field.id);
                    const words = answer.value
                        .toLowerCase()
                        .replace(/[^\w\s]|_/g, '')
                        .split(/\s+/);
                    words.forEach((word) => {
                        if (word && !STOP_WORDS.has(word)) {
                            wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
                        }
                    });
                }
                else if (numericFieldAnalytics.has(field.id) &&
                    typeof answer.value === 'number') {
                    numericFieldAnalytics.get(field.id).push(answer.value);
                }
            });
        });
        const finalFieldAnalytics = Array.from(choiceFieldAnalytics.entries()).map(([fieldId, counts]) => ({
            fieldId,
            label: fieldMap.get(fieldId).label,
            type: fieldMap.get(fieldId).type,
            options: Array.from(counts.entries()).map(([option, count]) => ({
                option,
                count,
            })),
        }));
        const finalTextAnalytics = Array.from(textFieldAnalytics.entries()).map(([fieldId, wordCounts]) => ({
            fieldId,
            label: fieldMap.get(fieldId).label,
            type: fieldMap.get(fieldId).type,
            wordFrequencies: Array.from(wordCounts.entries())
                .map(([word, count]) => ({ word, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 20),
        }));
        const finalNumericAnalytics = Array.from(numericFieldAnalytics.entries()).map(([fieldId, values]) => ({
            fieldId,
            label: fieldMap.get(fieldId).label,
            type: fieldMap.get(fieldId).type,
            stats: this._calculateNumericStats(values),
        }));
        return {
            submissionTrend: Array.from(trend.entries()).map(([date, count]) => ({
                date,
                count,
            })),
            submissionsByDayOfWeek: byDayOfWeek,
            submissionsByHourOfDay: byHourOfDay,
            fieldAnalytics: finalFieldAnalytics,
            textAnalytics: finalTextAnalytics,
            numericAnalytics: finalNumericAnalytics,
            views: totalViews,
            completionRate,
            funnel: {
                views: totalViews,
                submissions: totalSubmissions,
            },
        };
    }
    _calculateNumericStats(values) {
        if (values.length === 0) {
            return { count: 0, sum: 0, mean: 0, min: 0, max: 0, histogram: [] };
        }
        const sum = values.reduce((s, v) => s + v, 0);
        const min = Math.min(...values);
        const max = Math.max(...values);
        let histogram;
        if (min === max) {
            histogram = [{ bin: min.toFixed(2), count: values.length }];
        }
        else {
            const numBins = 10;
            const binWidth = (max - min) / numBins;
            histogram = Array(numBins)
                .fill(0)
                .map((_, i) => {
                const binMin = min + i * binWidth;
                const binMax = binMin + binWidth;
                const isLastBin = i === numBins - 1;
                const count = values.filter((v) => v >= binMin && (isLastBin ? v <= binMax : v < binMax)).length;
                return { bin: `${binMin.toFixed(2)}-${binMax.toFixed(2)}`, count };
            });
        }
        return {
            count: values.length,
            sum,
            mean: sum / values.length,
            min,
            max,
            histogram,
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        integrations_service_1.IntegrationsService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map