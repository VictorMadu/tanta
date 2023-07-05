import { TransactionControl } from 'src/lib/concurrency-control';
import { DateTime } from 'src/lib/date-time';
import { Money } from 'src/features/wallet/money';
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
    transactionId,
    type,
  }: {
    lastTransaction: Transaction | null;
    walletId: string;
    amount: Money;
    type: TransactionType;
    transactionId: string;
  }) {
    const transactionControl =
      lastTransaction?.getTransactionControl().clone() ??
      TransactionControl.init();

    return new Transaction(
      transactionId,
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

  getId() {
    return this.transactionId;
  }

  getType() {
    return this.type;
  }

  getAmount(): Money {
    return this.amount;
  }

  getCreationTime() {
    return this.createdAt;
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
