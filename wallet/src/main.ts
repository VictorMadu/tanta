import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import config from './config';
import { ControllersModule } from './controllers/controller.module';
import { FeaturesModule } from './features/features.module';

@Module({
  imports: [ControllersModule, FeaturesModule],
})
class MainModule {
  static async bootstrap() {
    const app = await NestFactory.create(MainModule);
    await app.listen(config.port);
  }
}

MainModule.bootstrap();
