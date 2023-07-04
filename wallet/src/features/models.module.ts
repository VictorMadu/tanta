import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification-module';
import { TransactionModule } from './transaction/transaction.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [WalletModule, TransactionModule, NotificationModule],
})
export class FeaturesModule {}
