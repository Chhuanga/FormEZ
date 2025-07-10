import { DecodedIdToken } from 'firebase-admin/auth';
export interface AuthenticatedRequest extends Request {
    user: DecodedIdToken;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
