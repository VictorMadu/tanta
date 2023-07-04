import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import config from './config';

@Module({
  imports: [],
})
class MainModule {
  static async bootstrap() {
    const app = await NestFactory.create(MainModule);
    await app.listen(config.port);
  }
}

MainModule.bootstrap();
