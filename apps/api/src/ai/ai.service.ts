import { Injectable } from '@nestjs/common';
import { FormsService } from '../forms/forms.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { FormFieldDto } from '../forms/dto/form-field.dto';

@Injectable()
export class AiService {
  constructor(private readonly formsService: FormsService) {}

  async generateFormFromPrompt(prompt: string, user: DecodedIdToken) {
    const mockGeneratedFields: FormFieldDto[] = [
      {
        id: 'full_name',
        type: 'Text',
        label: 'Full Name',
        validation: { required: true },
      },
      {
        id: 'email_address',
        type: 'Email',
        label: 'Email Address',
        validation: { required: true },
      },
      {
        id: 'feedback_topic',
        type: 'RadioGroup',
        label: 'What is your feedback about?',
        options: ['The course content', 'The instructor', 'The platform'],
        validation: { required: true },
      },
      {
        id: 'feedback_message',
        type: 'Textarea',
        label: 'Your Message',
        validation: { required: false },
      },
    ];

    const newForm = await this.formsService.create(
      {
        title: `AI: ${prompt.substring(0, 40)}...`,
        fields: mockGeneratedFields,
      },
      user.uid,
    );

    return newForm;
  }
}
