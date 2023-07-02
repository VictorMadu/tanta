import { Module } from '@nestjs/common';
import { DbManagerService } from './db-manager.service';

@Module({
  providers: [DbManagerService],
  exports: [DbManagerService],
})
export class DbManagerModule {}
