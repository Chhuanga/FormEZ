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
exports.AccountsController = void 0;
const common_1 = require("@nestjs/common");
const integrations_service_1 = require("./integrations.service");
const firebase_guard_1 = require("../auth/firebase.guard");
let AccountsController = class AccountsController {
    integrationsService;
    constructor(integrationsService) {
        this.integrationsService = integrationsService;
    }
    getAccounts(req) {
        const userId = req.user.uid;
        return this.integrationsService.getAccounts(userId);
    }
};
exports.AccountsController = AccountsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "getAccounts", null);
exports.AccountsController = AccountsController = __decorate([
    (0, common_1.Controller)('integrations/accounts'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], AccountsController);
//# sourceMappingURL=accounts.controller.js.map