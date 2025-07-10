import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { FirebaseGuard } from '../auth/firebase.guard';
import { CurrentUser } from '../auth/auth.decorators';
import { DecodedIdToken } from 'firebase-admin/auth';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post(':formId')
  create(
    @Param('formId') formId: string,
    @Body() createSubmissionDto: CreateSubmissionDto,
  ) {
    return this.submissionsService.create(formId, createSubmissionDto);
  }

  @Get('form/:formId')
  @UseGuards(FirebaseGuard)
  findByFormId(
    @Param('formId') formId: string,
    @Request() req: { user: { uid: string } },
  ) {
    const userId = req.user.uid;
    return this.submissionsService.findByFormId(formId, userId);
  }

  @Get('analytics/:formId')
  @UseGuards(FirebaseGuard)
  getAnalytics(
    @Param('formId') formId: string,
    @CurrentUser() user: DecodedIdToken,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const dateRange = from && to ? { from, to } : undefined;
    return this.submissionsService.getAnalyticsByFormId(
      formId,
      user.uid,
      dateRange,
    );
  }

  @Get(':submissionId')
  @UseGuards(FirebaseGuard)
  findOne(
    @Param('submissionId') submissionId: string,
    @Request() req: { user: { uid: string } },
  ) {
    const userId = req.user.uid;
    return this.submissionsService.findOne(submissionId, userId);
  }
}
