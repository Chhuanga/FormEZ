import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class FirebaseGuard implements CanActivate {
    private defaultApp;
    constructor();
    canActivate(context: ExecutionContext): Promise<boolean>;
}
