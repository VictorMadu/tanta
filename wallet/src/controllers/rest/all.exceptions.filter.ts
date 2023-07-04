import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ValidationException } from './validation.pipe';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus: number;
    let responseBody: {
      error: string | null;
    };

    if (exception instanceof ValidationException) {
      httpStatus = exception.getStatus();
      responseBody = {
        error: exception.errMsg,
      };
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();

      responseBody = {
        error: exception.message,
      };
    } else {
      httpStatus = 500;
      responseBody = {
        error: 'UNKNOWN',
      };
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
