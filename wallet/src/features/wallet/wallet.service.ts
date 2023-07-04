import { Injectable } from '@nestjs/common';
import { Exception } from 'src/lib/exception';
import { Pagination } from 'src/lib/pagination';
import { TransactionType } from 'src/features/transaction/transaction-type';
import { Transaction } from 'src/features/transaction/transaction.entity';
import { BalanceType } from './balance-type';
import { WalletCode } from './exception-code';
import { Money } from './money';
import { Wallet } from './wallet.entity';
import { WalletRepository } from './wallet.repository';

@Injectable()
export class WalletService {
  constructor(private walletRepository: WalletRepository) {}

  async create({ userId }: { userId: string }): Promise<Wallet> {
    const wallet = Wallet.create({ userId });

    await this.walletRepository.save(wallet);
    return wallet;
  }

  async getWalletsByUser({
    userId,
    pagination,
  }: {
    userId: string;
    pagination: Pagination;
  }): Promise<Wallet[]> {
    return this.walletRepository.getWalletsByUser({ userId, pagination });
  }

  getWalletById({ walletId }: { walletId: string }) {
    return this.walletRepository.getWalletById({ walletId });
  }

  async updateBalance({
    walletId,
    transactions,
  }: {
    walletId: string;
    transactions: Transaction[];
  }): Promise<Wallet> {
    const wallet = await this.walletRepository.getWalletById({ walletId });

    let transaction: Transaction;
    let balance: Money;
    let type: BalanceType;
    let version: number;

    console.log('RRRRRRRRRRRR', transactions.length);

    for (let i = 0; i < transactions.length; i++) {
      transaction = transactions[i];
      version = transaction.getTransactionControl().getVersion();

      console.log('\n\n\n\n\nWALLET', version);
      console.log('\n\n\n\n\nWALLET TYPE', wallet.getLastTransactionVersion());

      if (wallet.getLastTransactionVersion() + 1 !== version) {
        throw new Exception(WalletCode.INVALID_TRANSACTIONS);
      }

      if (transaction.getType() === TransactionType.IN) {
        if (
          wallet.getBalanceType() === BalanceType.OVERDRAFT &&
          transaction.getAmount().greaterOrEqual(wallet.getBalance())
        ) {
          balance = wallet.getBalance().difference(transaction.getAmount());
          type = BalanceType.IDEAL;
        } else {
          balance = wallet.getBalance().add(transaction.getAmount());
          type = wallet.getBalanceType();
        }
      } else {
        if (
          wallet.getBalanceType() === BalanceType.IDEAL &&
          transaction.getAmount().greaterOrEqual(wallet.getBalance())
        ) {
          balance = wallet.getBalance().difference(transaction.getAmount());
          type = BalanceType.OVERDRAFT;
        } else {
          balance = wallet.getBalance().add(transaction.getAmount());
          type = wallet.getBalanceType();
        }
      }

      wallet.updateBalanceData(balance, type, version);
    }

    await this.walletRepository.save(wallet);
    return wallet;
  }
}
