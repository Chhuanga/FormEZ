import { CanActivate, ExecutionContext } from '@nestjs/common';
import { App } from 'firebase-admin/app';
export declare class FirebaseGuard implements CanActivate {
    private app;
    constructor();
    canActivate(context: ExecutionContext): Promise<boolean>;
}
declare global {
    var firebaseApp: App;
}
