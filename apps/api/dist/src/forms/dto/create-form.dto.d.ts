import * as Joi from 'joi';
import { FormFieldDto } from './form-field.dto';
export declare class CreateFormDto {
    title: string;
    fields: FormFieldDto[];
    theme?: any;
    postSubmissionSettings?: any;
    static readonly schema: Joi.ObjectSchema<any>;
}
