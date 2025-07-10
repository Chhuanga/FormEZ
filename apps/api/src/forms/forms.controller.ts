import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FirebaseGuard } from 'src/auth/firebase.guard';
import { CurrentUser } from 'src/auth/auth.decorators';
import { DecodedIdToken } from 'firebase-admin/auth';
import { JoiValidationPipe } from './joi-validation.pipe';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @UseGuards(FirebaseGuard)
  create(
    @Body(new JoiValidationPipe(CreateFormDto.schema))
    createFormDto: CreateFormDto,
    @CurrentUser() user: DecodedIdToken,
  ) {
    return this.formsService.create(createFormDto, user.uid);
  }

  @Post(':id/view')
  @HttpCode(204)
  logFormView(@Param('id') id: string) {
    // This is a fire-and-forget operation from the client's perspective
    this.formsService.logFormView(id);
  }

  @Get()
  @UseGuards(FirebaseGuard)
  findAll(@CurrentUser() user: DecodedIdToken) {
    return this.formsService.findAll(user.uid);
  }

  @Get(':id')
  @UseGuards(FirebaseGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: DecodedIdToken) {
    return this.formsService.findOne(id, user.uid);
  }

  @Get('public/:id')
  findOnePublicly(@Param('id') id: string) {
    return this.formsService.findOnePublicly(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseGuard)
  update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(UpdateFormDto.schema))
    updateFormDto: UpdateFormDto,
    @CurrentUser() user: DecodedIdToken,
  ) {
    return this.formsService.update(id, user.uid, updateFormDto);
  }

  @Delete(':id')
  @UseGuards(FirebaseGuard)
  remove(@Param('id') id: string, @CurrentUser() user: DecodedIdToken) {
    return this.formsService.remove(id, user.uid);
  }
}
