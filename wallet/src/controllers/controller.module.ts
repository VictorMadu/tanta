import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './rest/all.exceptions.filter';
import { LoggingInterceptor } from './rest/logging.interceptors';
import { ValidationPipe } from './rest/validation.pipe';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(),
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    LoggingInterceptor,
  ],
  exports: [LoggingInterceptor],
})
export class ControllerModule {}
