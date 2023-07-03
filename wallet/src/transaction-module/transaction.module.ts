import { Module } from '@nestjs/common';
import { DbManagerModule } from 'src/db-manager/db-manager.module';
import { WalletModule } from 'src/wallet-module/wallet.module';
import { TransactionRepository } from './transaction.repository';
import { TransactionService } from './transaction.service';

@Module({
  imports: [DbManagerModule, WalletModule],
  providers: [TransactionService, TransactionRepository],
})
export class TransactionModule {}
