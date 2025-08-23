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
exports.CollaborationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let CollaborationGateway = class CollaborationGateway {
    server;
    logger = new common_1.Logger('CollaborationGateway');
    formSessions = new Map();
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        for (const [formId, users] of this.formSessions) {
            if (users.has(client.id)) {
                const user = users.get(client.id);
                users.delete(client.id);
                client.to(formId).emit('user_left', {
                    userId: user?.id,
                    userName: user?.displayName,
                });
                this.broadcastCollaborators(formId);
            }
        }
    }
    async handleJoinForm(client, data) {
        const { formId, user } = data;
        await client.join(formId);
        if (!this.formSessions.has(formId)) {
            this.formSessions.set(formId, new Map());
        }
        this.formSessions.get(formId).set(client.id, user);
        client.to(formId).emit('user_joined', { user });
        this.broadcastCollaborators(formId);
        this.logger.log(`User ${user.displayName} joined form ${formId}`);
    }
    handleFormUpdate(client, data) {
        const { formId, update } = data;
        client.to(formId).emit('form_update', update);
        this.logger.log(`Form update in ${formId}: ${update.type}`);
    }
    handleCursorMove(client, data) {
        const { formId, position } = data;
        const user = this.formSessions.get(formId)?.get(client.id);
        if (user) {
            client.to(formId).emit('cursor_update', {
                userId: user.id,
                position,
            });
        }
    }
    async handleLeaveForm(client, data) {
        const { formId } = data;
        await client.leave(formId);
        const formSession = this.formSessions.get(formId);
        if (formSession?.has(client.id)) {
            const user = formSession.get(client.id);
            formSession.delete(client.id);
            client.to(formId).emit('user_left', {
                userId: user?.id,
                userName: user?.displayName,
            });
            this.broadcastCollaborators(formId);
        }
        this.logger.log(`User left form ${formId}`);
    }
    broadcastCollaborators(formId) {
        const collaborators = Array.from(this.formSessions.get(formId)?.values() || []);
        this.server.to(formId).emit('collaborators_list', { collaborators });
    }
};
exports.CollaborationGateway = CollaborationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CollaborationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_form'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CollaborationGateway.prototype, "handleJoinForm", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('form_update'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleFormUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('cursor_move'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleCursorMove", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_form'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CollaborationGateway.prototype, "handleLeaveForm", null);
exports.CollaborationGateway = CollaborationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/collaboration',
    })
], CollaborationGateway);
//# sourceMappingURL=collaboration.gateway.js.map