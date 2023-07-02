import { Module } from '@nestjs/common';
import { DbManagerModule } from 'src/db-manager/db-manager.module';
import { WalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';

@Module({
  imports: [DbManagerModule],
  providers: [WalletService, WalletRepository],
})
export class WalletModule {}
