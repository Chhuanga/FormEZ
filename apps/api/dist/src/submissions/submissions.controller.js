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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionsController = void 0;
const common_1 = require("@nestjs/common");
const submissions_service_1 = require("./submissions.service");
const create_submission_dto_1 = require("./dto/create-submission.dto");
const firebase_guard_1 = require("../auth/firebase.guard");
const auth_decorators_1 = require("../auth/auth.decorators");
let SubmissionsController = class SubmissionsController {
    submissionsService;
    constructor(submissionsService) {
        this.submissionsService = submissionsService;
    }
    create(formId, createSubmissionDto) {
        return this.submissionsService.create(formId, createSubmissionDto);
    }
    findByFormId(formId, req) {
        const userId = req.user.uid;
        return this.submissionsService.findByFormId(formId, userId);
    }
    getAnalytics(formId, user, from, to) {
        const dateRange = from && to ? { from, to } : undefined;
        return this.submissionsService.getAnalyticsByFormId(formId, user.uid, dateRange);
    }
    getAiAnalyticsSummary(formId, user, from, to) {
        const dateRange = from && to ? { from, to } : undefined;
        return this.submissionsService.getAiAnalyticsSummary(formId, user.uid, dateRange);
    }
    findOne(submissionId, req) {
        const userId = req.user.uid;
        return this.submissionsService.findOne(submissionId, userId);
    }
};
exports.SubmissionsController = SubmissionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('formId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_submission_dto_1.CreateSubmissionDto]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __param(0, (0, common_1.Param)('formId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "findByFormId", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __param(0, (0, common_1.Param)('formId')),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/ai-summary'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __param(0, (0, common_1.Param)('formId')),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "getAiAnalyticsSummary", null);
__decorate([
    (0, common_1.Get)(':submissionId'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "findOne", null);
exports.SubmissionsController = SubmissionsController = __decorate([
    (0, common_1.Controller)('forms/:formId/submissions'),
    __metadata("design:paramtypes", [submissions_service_1.SubmissionsService])
], SubmissionsController);
//# sourceMappingURL=submissions.controller.js.map