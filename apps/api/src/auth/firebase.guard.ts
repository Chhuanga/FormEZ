import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
}

@Injectable()
export class FirebaseGuard implements CanActivate {
  private app: App;

  constructor() {
    // Initialize only once
    if (!global.firebaseApp) {
      global.firebaseApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    this.app = global.firebaseApp;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return false;
    }

    const token = authorization.split('Bearer ')[1];

    if (!token) {
      return false;
    }

    try {
      const decodedToken = await getAuth(this.app).verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (err) {
      console.error('Firebase authentication error:', err);
      return false;
    }
  }
}

// Add a global variable to hold the initialized app
declare global {
  // eslint-disable-next-line no-var
  var firebaseApp: App;
}
