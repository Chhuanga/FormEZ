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
exports.CollaboratorsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const firebase_guard_1 = require("../auth/firebase.guard");
const auth_decorators_1 = require("../auth/auth.decorators");
let CollaboratorsController = class CollaboratorsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async requestAccess(formId, user) {
        const userId = user.uid;
        const userEmail = user.email || '';
        const userName = user.name || user.displayName || userEmail || 'Anonymous';
        const form = await this.prisma.form.findUnique({
            where: { id: formId },
        });
        if (!form) {
            throw new common_1.NotFoundException('Form not found');
        }
        if (form.userId === userId) {
            return { message: 'You are the owner of this form' };
        }
        const existingCollaboration = await this.prisma.formCollaborator.findUnique({
            where: {
                formId_userId: {
                    formId,
                    userId,
                },
            },
        });
        if (existingCollaboration) {
            return { message: 'You are already a collaborator' };
        }
        await this.prisma.user.upsert({
            where: { id: userId },
            update: {
                email: userEmail,
                name: userName,
            },
            create: {
                id: userId,
                email: userEmail,
                name: userName,
            },
        });
        const collaboration = await this.prisma.formCollaborator.create({
            data: {
                formId,
                userId,
                role: 'editor',
            },
        });
        return {
            message: 'Access granted - you are now a collaborator!',
            collaboration,
        };
    }
};
exports.CollaboratorsController = CollaboratorsController;
__decorate([
    (0, common_1.Post)('request'),
    __param(0, (0, common_1.Param)('formId')),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CollaboratorsController.prototype, "requestAccess", null);
exports.CollaboratorsController = CollaboratorsController = __decorate([
    (0, common_1.Controller)('forms/:formId/collaborators'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CollaboratorsController);
//# sourceMappingURL=collaborators.controller.js.map