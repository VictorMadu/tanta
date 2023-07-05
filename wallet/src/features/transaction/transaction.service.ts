import { Injectable } from '@nestjs/common';
import { Exception } from 'src/lib/exception';
import { Pagination } from 'src/lib/pagination';
import { NotificationType } from 'src/features/notification/notification-type';
import { Money } from 'src/features/wallet/money';
import { Wallet } from 'src/features/wallet/wallet.entity';
import { WalletService } from 'src/features/wallet/wallet.service';
import { TransactionCode } from './exception-code';
import { TransactionType } from './transaction-type';
import { Transaction } from './transaction.entity';
import { TransactionRepository } from './transaction.repository';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TransactionService {
  constructor(
    private transactionRepository: TransactionRepository,
    private walletService: WalletService,
    private notificationService: NotificationService,
  ) {}

  async credit({
    transactionId,
    walletId,
    amount,
  }: {
    transactionId: string;
    walletId: string;
    amount: Money;
  }): Promise<Transaction> {
    const lastTransaction = await this.transactionRepository.getLastIfExistsBy({
      walletId,
    });

    const transaction = Transaction.create({
      lastTransaction,
      walletId,
      amount,
      type: TransactionType.IN,
      transactionId,
    });
    console.log(
      'BEFORE_SAVE',
      transaction.getTransactionControl().getVersion(),
    );
    await this.transactionRepository.save(transaction);
    console.log('AFTER_SAVE', transaction.getTransactionControl().getVersion());

    const wallet = await this.walletService.getWalletById({ walletId });
    await this.updateWallet({ wallet });

    return transaction;
  }

  async debit({
    walletId,
    amount,
    notificationType,
    transactionId,
  }: {
    walletId: string;
    amount: Money;
    notificationType: NotificationType;
    transactionId: string;
  }): Promise<Transaction> {
    const wallet = await this.walletService.getWalletById({ walletId });

    if (!wallet.hasUpTo(amount)) {
      this.notificationService.notifyUser({
        userId: wallet.getUserId(),
        message: `Your transaction was not successful due to insufficient fund.`,
        notificationType,
      });
      throw new Exception(TransactionCode.INSUFFICIENT_FUND);
    }

    const lastTransaction = await this.transactionRepository.getLastIfExistsBy({
      walletId,
    });

    const transaction = Transaction.create({
      lastTransaction,
      walletId,
      amount,
      type: TransactionType.OUT,
      transactionId,
    });

    await this.transactionRepository.save(transaction);

    await this.updateWallet({ wallet });

    return transaction;
  }

  getTransactionIfExists({
    transactionId,
  }: {
    transactionId: string;
  }): Promise<Transaction | null> {
    return this.transactionRepository.getTransactionIfExists({ transactionId });
  }

  private async updateWallet({ wallet }: { wallet: Wallet }) {
    const transactions = await this.transactionRepository.getAllInAscOrderAfter(
      { version: wallet.getLastTransactionVersion() },
    );

    console.log('transactions', transactions);

    await this.walletService.updateBalance({
      walletId: wallet.getId(),
      transactions,
    });
  }
}
