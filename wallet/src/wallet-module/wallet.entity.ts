import { DateTime } from 'src/lib/date-time';
import { Money } from './money';
import * as uuid from 'uuid';
import { Currency } from './currency';
import { TransactionControl } from 'src/lib/concurrency-control';

export class Wallet {
  constructor(
    private walletId: string,
    private userId: string,
    private createdAt: DateTime,
    private balance: Money,
    private lastTransactionVersion: number,
    private transactionControl: TransactionControl,
  ) {}

  static create({ userId }: { userId: string }): Wallet {
    return new Wallet(
      uuid.v4(),
      userId,
      DateTime.now(),
      new Money(0, Currency.NGN),
      0,
      TransactionControl.init(),
    );
  }

  getId(): string {
    return this.walletId;
  }

  getUserId(): string {
    return this.userId;
  }

  getCreationTime(): DateTime {
    return this.createdAt;
  }

  getBalance(): Money {
    return this.balance;
  }

  getLastTransactionVersion(): number {
    return this.lastTransactionVersion;
  }

  equals(other: Wallet): any {
    return (
      this.walletId === other.walletId &&
      this.userId === other.userId &&
      this.createdAt.equals(other.createdAt) &&
      this.balance.equals(other.balance) &&
      this.lastTransactionVersion === other.lastTransactionVersion
    );
  }

  getTransactionControl() {
    return this.transactionControl;
  }

  setTransactionControl(transactionControl: TransactionControl) {
    this.transactionControl = transactionControl;
    return this;
  }

  static getState(wallet: Wallet) {
    return {
      walletId: wallet.walletId,
      userId: wallet.userId,
      createdAt: wallet.createdAt,
      balance: wallet.balance,
      lastTransactionVersion: wallet.lastTransactionVersion,
    };
  }
}
