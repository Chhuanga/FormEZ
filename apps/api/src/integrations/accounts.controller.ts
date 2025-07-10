import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { FirebaseGuard } from '../auth/firebase.guard';
import { AuthenticatedRequest } from '../auth/auth.decorators';

@Controller('integrations/accounts')
@UseGuards(FirebaseGuard)
export class AccountsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  async getAccounts(@Req() req: AuthenticatedRequest) {
    const userId = req.user.uid;
    return this.integrationsService.getAccounts(userId);
  }
}
