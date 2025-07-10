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
exports.FirebaseGuard = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
const path = require("path");
let FirebaseGuard = class FirebaseGuard {
    defaultApp;
    constructor() {
        const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
        if (!admin.apps.length) {
            this.defaultApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccountPath),
            });
        }
        else {
            this.defaultApp = admin.app();
        }
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        const token = authHeader?.split('Bearer ')[1];
        if (!token) {
            return false;
        }
        try {
            const decodedToken = await this.defaultApp.auth().verifyIdToken(token);
            request.user = decodedToken;
            return true;
        }
        catch (error) {
            console.error('Error verifying Firebase token:', error);
            return false;
        }
    }
};
exports.FirebaseGuard = FirebaseGuard;
exports.FirebaseGuard = FirebaseGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FirebaseGuard);
//# sourceMappingURL=firebase.guard.js.map