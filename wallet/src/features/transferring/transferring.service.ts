import { Injectable } from '@nestjs/common';
import { Exception } from 'src/lib/exception';
import { NotificationType } from '../notification/notification-type';
import { Transaction } from '../transaction/transaction.entity';
import { TransactionService } from '../transaction/transaction.service';
import { Money } from '../wallet/money';
import { WalletService } from '../wallet/wallet.service';
import { TransferringCode } from './exception.code';
import { Transferring } from './transferring.entity';

@Injectable()
export class TransferringService {
  constructor(
    private walletService: WalletService,
    private transactionService: TransactionService,
  ) {}

  async transfer({
    senderUserId,
    senderWalletId,
    receiverWalletId,
    amount,
    notificationType,
  }: {
    senderUserId: string;
    senderWalletId: string;
    receiverWalletId: string;
    amount: Money;
    notificationType: NotificationType;
  }): Promise<Transferring> {
    const wallet = await this.walletService.getWalletById({
      walletId: senderWalletId,
    });

    if (wallet.getUserId() !== senderUserId) {
      throw new Exception(TransferringCode.NOT_ALLOWED);
    }

    const transferring = Transferring.initalize({
      senderWalletId,
      receiverWalletId,
      amount,
      notificationType,
    });

    await this.process(transferring);

    return transferring;
  }

  private async process(transferring: Transferring) {
    let transactionId: string;
    let transaction: Transaction | null;

    transactionId = transferring.getSenderDebitTransactionId();
    transaction = await this.transactionService.getTransactionIfExists({
      transactionId,
    });
    if (transaction == null) {
      await this.transactionService.debit({
        walletId: transferring.getSenderWalletId(),
        transactionId,
        amount: transferring.getAmount(),
        notificationType: transferring.getNotificationType(),
      });
    }

    transactionId = transferring.getReceiverCreditTransactionId();
    transaction = await this.transactionService.getTransactionIfExists({
      transactionId,
    });
    if (transaction == null) {
      await this.transactionService.credit({
        walletId: transferring.getSenderWalletId(),
        transactionId,
        amount: transferring.getAmount(),
      });
    }
  }
}
