import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { WalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';

@Module({
  imports: [DatabaseModule],
  providers: [WalletService, WalletRepository],
  exports: [WalletService],
})
export class WalletModule {}
