import { CreateFormDto } from './create-form.dto';
import * as Joi from 'joi';
declare const UpdateFormDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateFormDto>>;
export declare class UpdateFormDto extends UpdateFormDto_base {
    static readonly schema: Joi.ObjectSchema<any>;
    formSettings?: any;
    postSubmissionSettings?: any;
}
export {};
