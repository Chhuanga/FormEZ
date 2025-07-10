import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FormsModule } from './forms/forms.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { FilesModule } from './files/files.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    FormsModule,
    SubmissionsModule,
    FilesModule,
    IntegrationsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
