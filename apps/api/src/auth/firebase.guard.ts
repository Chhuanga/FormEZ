import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { AuthenticatedRequest } from './auth.decorators';

@Injectable()
export class FirebaseGuard implements CanActivate {
  private defaultApp: admin.app.App;

  constructor() {
    const serviceAccountPath = path.join(
      process.cwd(),
      'firebase-service-account.json',
    );
    
    // Check if the app is already initialized
    if (!admin.apps.length) {
      this.defaultApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
    } else {
      this.defaultApp = admin.app();
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers['authorization'] as string;
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return false;
    }

    try {
      const decodedToken = await this.defaultApp.auth().verifyIdToken(token);
      request.user = decodedToken; // Attach user to the request
      return true;
    } catch (error) {
      console.error('Error verifying Firebase token:', error);
      return false;
    }
  }
} 