import { PipeTransform } from '@nestjs/common';
import { ObjectSchema } from 'joi';
export declare class JoiValidationPipe<T> implements PipeTransform<any, T> {
    private schema;
    constructor(schema: ObjectSchema);
    transform(value: unknown): T;
}
