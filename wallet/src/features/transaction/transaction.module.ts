import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { WalletModule } from 'src/features/wallet/wallet.module';
import { NotificationModule } from '../notification/notification-module';
import { TransactionRepository } from './transaction.repository';
import { TransactionService } from './transaction.service';

@Module({
  imports: [DatabaseModule, WalletModule, NotificationModule],
  providers: [TransactionService, TransactionRepository],
  exports: [TransactionService],
})
export class TransactionModule {}
