import * as Joi from 'joi';
export declare class CreateFormDto {
    title: string;
    fields: any[];
    theme?: any;
    postSubmissionSettings?: any;
    static readonly schema: Joi.ObjectSchema<any>;
}
