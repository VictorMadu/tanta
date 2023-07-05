import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification-module';
import { TransactionModule } from './transaction/transaction.module';
import { TransferringModule } from './transferring/transferring.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    WalletModule,
    TransactionModule,
    TransferringModule,
    NotificationModule,
    UserModule,
  ],
  exports: [
    WalletModule,
    TransactionModule,
    TransferringModule,
    NotificationModule,
    UserModule,
  ],
})
export class FeaturesModule {}
