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
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const firebase_guard_1 = require("../auth/firebase.guard");
let IntegrationsController = class IntegrationsController {
    getIntegrationsForForm(formId) {
        console.log(`Fetching integrations for form ${formId} (placeholder)`);
        return [];
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __param(0, (0, common_1.Param)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getIntegrationsForForm", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, common_1.Controller)('forms/:formId/integrations')
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map