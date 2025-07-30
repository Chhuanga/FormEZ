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
exports.FormsController = void 0;
const common_1 = require("@nestjs/common");
const forms_service_1 = require("./forms.service");
const create_form_dto_1 = require("./dto/create-form.dto");
const update_form_dto_1 = require("./dto/update-form.dto");
const firebase_guard_1 = require("../auth/firebase.guard");
const auth_decorators_1 = require("../auth/auth.decorators");
const joi_validation_pipe_1 = require("./joi-validation.pipe");
let FormsController = class FormsController {
    formsService;
    constructor(formsService) {
        this.formsService = formsService;
    }
    create(createFormDto, user) {
        return this.formsService.create(createFormDto, user.uid);
    }
    logFormView(id) {
        this.formsService.logFormView(id);
    }
    findAll(user) {
        return this.formsService.findAll(user.uid);
    }
    findOne(id, user) {
        return this.formsService.findOne(id, user.uid);
    }
    findOnePublicly(id) {
        return this.formsService.findOnePublicly(id);
    }
    update(id, updateFormDto, user) {
        return this.formsService.update(id, user.uid, updateFormDto);
    }
    remove(id, user) {
        return this.formsService.remove(id, user.uid);
    }
    findSubmissions(id, user) {
        return this.formsService.findSubmissions(id, user.uid);
    }
    getIntegrations(id, user) {
        return this.formsService.getIntegrations(id, user.uid);
    }
};
exports.FormsController = FormsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __param(0, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(create_form_dto_1.CreateFormDto.schema))),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_form_dto_1.CreateFormDto, Object]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/view'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "logFormView", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('public/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "findOnePublicly", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new joi_validation_pipe_1.JoiValidationPipe(update_form_dto_1.UpdateFormDto.schema))),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_form_dto_1.UpdateFormDto, Object]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/submissions'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "findSubmissions", null);
__decorate([
    (0, common_1.Get)(':id/integrations'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "getIntegrations", null);
exports.FormsController = FormsController = __decorate([
    (0, common_1.Controller)('forms'),
    __metadata("design:paramtypes", [forms_service_1.FormsService])
], FormsController);
//# sourceMappingURL=forms.controller.js.map