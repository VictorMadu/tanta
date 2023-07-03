import { DateTime } from 'src/lib/date-time';
import { Money } from './money';
import * as uuid from 'uuid';
import { Currency } from './currency';
import { TransactionControl } from 'src/lib/concurrency-control';
import { BalanceType } from './balance-type';
import * as _ from 'lodash';

export class Wallet {
  constructor(
    private walletId: string,
    private userId: string,
    private balance: Money,
    private balanceType: BalanceType,
    private lastTransactionVersion: number,
    private createdAt: DateTime,
    private transactionControl: TransactionControl,
  ) {}

  static create({ userId }: { userId: string }): Wallet {
    return new Wallet(
      uuid.v4(),
      userId,
      new Money(0, Currency.NGN),
      BalanceType.IDEAL,
      0,
      DateTime.now(),
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

  hasUpTo(amount: Money) {
    return this.balance.greaterOrEqual(amount);
  }

  getBalance(): Money {
    return this.balance;
  }

  getLastTransactionVersion(): number {
    return this.lastTransactionVersion;
  }

  getBalanceType(): BalanceType {
    return this.balanceType;
  }

  updateBalanceData(
    balance: Money,
    balanceType: BalanceType,
    transactionVersion: number,
  ) {
    this.balance = balance;
    this.balanceType = balanceType;
    this.lastTransactionVersion = transactionVersion;
    return this;
  }

  equals(other?: Wallet | null): any {
    return _.isEqual(this.getState(), other?.getState());
  }

  getTransactionControl() {
    return this.transactionControl;
  }

  setTransactionControl(transactionControl: TransactionControl) {
    this.transactionControl = transactionControl;
    return this;
  }

  getState() {
    return {
      walletId: this.walletId,
      userId: this.userId,
      createdAt: this.createdAt,
      balance: this.balance,
      balanceType: this.balanceType,
      lastTransactionVersion: this.lastTransactionVersion,
    };
  }
}
