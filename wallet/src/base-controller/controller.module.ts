import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './all.exceptions.filter';
import { LoggingInterceptor } from './logging.interceptors';
import { ValidationPipe } from './validation.pipe';

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
