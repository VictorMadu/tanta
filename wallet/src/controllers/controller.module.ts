import { Module } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptors';
import { RestModule } from './rest/rest.module';

@Module({
  imports: [RestModule],
  providers: [LoggingInterceptor],
})
export class ControllersModule {}
