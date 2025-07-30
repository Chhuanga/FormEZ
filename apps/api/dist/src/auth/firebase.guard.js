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
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
let FirebaseGuard = class FirebaseGuard {
    app;
    constructor() {
        if (!global.firebaseApp) {
            global.firebaseApp = (0, app_1.initializeApp)({
                credential: (0, app_1.cert)({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        }
        this.app = global.firebaseApp;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return false;
        }
        const token = authorization.split('Bearer ')[1];
        if (!token) {
            return false;
        }
        try {
            const decodedToken = await (0, auth_1.getAuth)(this.app).verifyIdToken(token);
            request.user = decodedToken;
            return true;
        }
        catch (err) {
            console.error('Firebase authentication error:', err);
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