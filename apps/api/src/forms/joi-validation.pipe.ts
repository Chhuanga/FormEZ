import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe<T> implements PipeTransform<any, T> {
  constructor(private schema: ObjectSchema) {}

  transform(value: unknown): T {
    if (
      value &&
      typeof value === 'object' &&
      'fields' in value &&
      typeof (value as Record<string, unknown>).fields === 'string'
    ) {
      try {
        (value as Record<string, unknown>).fields = JSON.parse(
          (value as Record<string, unknown>).fields as string,
        );
      } catch {
        throw new BadRequestException(
          'Validation failed: fields must be a valid JSON string',
        );
      }
    }

    const validationResult = this.schema.validate(value);
    if (validationResult.error) {
      throw new BadRequestException(
        `Validation failed: ${validationResult.error.message}`,
      );
    }
    return validationResult.value as T;
  }
}
