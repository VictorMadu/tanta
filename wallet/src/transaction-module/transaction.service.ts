import { Injectable } from '@nestjs/common';
import { Exception } from 'src/lib/exception';
import { Pagination } from 'src/lib/pagination';
import { NotificationType } from 'src/notification-module/notification-type';
import { Money } from 'src/wallet-module/money';
import { Wallet } from 'src/wallet-module/wallet.entity';
import { WalletService } from 'src/wallet-module/wallet.service';
import { TransactionCode } from './exception-code';
import { TransactionType } from './transaction-type';
import { Transaction } from './transaction.entity';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    private transactionRepository: TransactionRepository,
    private walletService: WalletService,
  ) {}

  async credit({
    senderTransactionId,
    walletId,
    amount,
  }: {
    senderTransactionId: string;
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
      senderTransactionId,
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
    senderTransactionId,
  }: {
    walletId: string;
    amount: Money;
    notificationType: NotificationType;
    senderTransactionId: string;
  }): Promise<Transaction> {
    const wallet = await this.walletService.getWalletById({ walletId });

    console.log('wallet.hasUpTo(amount)', wallet.hasUpTo(amount));
    console.log('wallet.getBalance()', wallet.getBalance());
    console.log('amount', amount);

    if (!wallet.hasUpTo(amount)) {
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
      senderTransactionId,
    });

    await this.transactionRepository.save(transaction);

    await this.updateWallet({ wallet });

    return transaction;
  }

  private async updateWallet({ wallet }: { wallet: Wallet }) {
    const version = wallet.getLastTransactionVersion();

    const transactions = await this.transactionRepository.getAllInAscOrderAfter(
      { version },
    );

    console.log('transactions', transactions);

    await this.walletService.updateBalance({
      walletId: wallet.getId(),
      transactions,
    });
  }
}
