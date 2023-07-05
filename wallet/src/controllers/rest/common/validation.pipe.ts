/* eslint-disable @typescript-eslint/ban-types */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class ValidationException extends BadRequestException {
  constructor(public errMsg: string | null) {
    super();
  }
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    console.log('Hee');
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    console.log('errors', errors);

    if (hasError(errors)) {
      throw new ValidationException(getFirstError(errors));
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

function hasError(errors: ValidationError[]) {
  return errors.length > 0;
}

function getFirstError(errors: ValidationError[]): string | null {
  for (let index = 0; index < errors.length; index++) {
    const error = errors[index];
    const constraints = error.constraints ?? {};
    const constriantKey = Object.keys(constraints)[0];

    if (constriantKey != null) return constraints[constriantKey];

    if (error.children) {
      const childFirstError = getFirstError(error.children);
      if (childFirstError != null) return childFirstError;
    }
  }
  return null;
}
