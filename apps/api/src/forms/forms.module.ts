import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { CollaboratorsController } from './collaborators.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { IntegrationsModule } from 'src/integrations/integrations.module';

@Module({
  imports: [PrismaModule, IntegrationsModule],
  controllers: [FormsController, CollaboratorsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}
