import { TransactionControl } from 'src/lib/concurrency-control';
import { DateTime } from 'src/lib/date-time';
import { Money } from 'src/wallet-module/money';
import { TransactionType } from './transaction-type';
import * as _ from 'lodash';

export class Transaction {
  constructor(
    private transactionId: string,
    private walletId: string,
    private amount: Money,
    private type: TransactionType,
    private createdAt: DateTime,
    private transactionControl: TransactionControl,
  ) {}

  static create({
    lastTransaction,
    walletId,
    amount,
    senderTransactionId,
    type,
  }: {
    lastTransaction: Transaction | null;
    walletId: string;
    amount: Money;
    type: TransactionType;
    senderTransactionId: string;
  }) {
    const transactionControl =
      lastTransaction?.getTransactionControl().clone() ??
      TransactionControl.init();

    return new Transaction(
      senderTransactionId,
      walletId,
      amount,
      type,
      DateTime.now(),
      transactionControl,
    );
  }

  getTransactionControl() {
    return this.transactionControl;
  }

  setTransactionControl(transactionControl: TransactionControl) {
    this.transactionControl = transactionControl;
    return this;
  }

  getType() {
    return this.type;
  }

  getAmount(): Money {
    return this.amount;
  }

  getWalletId(): string {
    return this.walletId;
  }

  equals(other?: Transaction | null) {
    return _.isEqual(this.getState(), other?.getState());
  }

  getState() {
    return {
      transactionId: this.transactionId,
      walletId: this.walletId,
      amount: this.amount,
      type: this.type,
      createdAt: this.createdAt,
    };
  }
}
