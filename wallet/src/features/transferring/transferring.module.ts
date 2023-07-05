import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { TransactionModule } from '../transaction/transaction.module';
import { WalletModule } from '../wallet/wallet.module';
import { TransferringRepository } from './transferring.repository';
import { TransferringService } from './transferring.service';

@Module({
  imports: [WalletModule, TransactionModule, DatabaseModule],
  providers: [TransferringService, TransferringRepository],
  exports: [TransferringService],
})
export class TransferringModule {}
