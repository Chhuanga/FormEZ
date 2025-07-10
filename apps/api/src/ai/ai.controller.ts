import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FirebaseGuard } from '../auth/firebase.guard';
import { CurrentUser } from '../auth/auth.decorators';
import { AiService } from './ai.service';
import { GenerateFormWithAiDto } from './dto/generate-form-with-ai.dto';
import { DecodedIdToken } from 'firebase-admin/auth';

@UseGuards(FirebaseGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-form')
  async generateForm(
    @Body() body: GenerateFormWithAiDto,
    @CurrentUser() user: DecodedIdToken,
  ) {
    // We are passing the full DecodedIdToken, but the service only needs the id.
    // The service will need to be updated to reflect this.
    // For now, we cast to `any` to make it work.
    return this.aiService.generateFormFromPrompt(body.prompt, user as any);
  }
}
