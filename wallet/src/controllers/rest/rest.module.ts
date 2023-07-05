import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { FeaturesModule } from 'src/features/features.module';
import { AllExceptionsFilter } from './common/all.exceptions.filter';
import { ValidationPipe } from './common/validation.pipe';
import { WalletController } from './wallet.controller';

@Module({
  imports: [FeaturesModule],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(),
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  controllers: [WalletController],
})
export class RestModule {}
