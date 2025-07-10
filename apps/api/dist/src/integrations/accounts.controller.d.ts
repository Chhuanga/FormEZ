import { IntegrationsService } from './integrations.service';
import { AuthenticatedRequest } from '../auth/auth.decorators';
export declare class AccountsController {
    private readonly integrationsService;
    constructor(integrationsService: IntegrationsService);
    getAccounts(req: AuthenticatedRequest): Promise<never[]>;
}
