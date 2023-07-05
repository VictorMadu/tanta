import { TransactionControl } from 'src/lib/concurrency-control';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import { Money } from '../wallet/money';
import { NotificationType } from '../notification/notification-type';

export enum Status {
  ONGOING = 'ONGOING',
}

export class Transferring {
  constructor(
    private transferringId: string,
    private senderWalletId: string,
    private receiverWalletId: string,
    private senderDebitTransactionId: string,
    private receiverDebitTransactionId: string,
    private amount: Money,
    private status: Status,
    private notificationType: NotificationType,
    private transactionControl: TransactionControl,
  ) {}

  static initalize({
    senderWalletId,
    receiverWalletId,
    amount,
    notificationType,
  }: {
    senderWalletId: string;
    receiverWalletId: string;
    amount: Money;
    notificationType: NotificationType;
  }) {
    return new Transferring(
      uuid.v4(),
      senderWalletId,
      receiverWalletId,
      uuid.v4(),
      uuid.v4(),
      amount,
      Status.ONGOING,
      notificationType,
      TransactionControl.init(),
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
    return this.transferringId;
  }

  getSenderDebitTransactionId() {
    return this.senderDebitTransactionId;
  }

  getReceiverCreditTransactionId() {
    return this.receiverDebitTransactionId;
  }

  getSenderWalletId(): string {
    return this.senderWalletId;
  }

  getAmount(): Money {
    return this.amount;
  }

  getNotificationType(): NotificationType {
    return this.notificationType;
  }

  getReceiverWalletId() {
    return this.receiverWalletId;
  }

  equals(other?: Transferring | null) {
    return _.isEqual(this.getState(), other?.getState());
  }

  getState() {
    return {
      transferringId: this.transferringId,
      senderWalletId: this.senderWalletId,
      receiverWalletId: this.receiverWalletId,
      senderDebitTransactionId: this.senderDebitTransactionId,
      receiverDebitTransactionId: this.receiverDebitTransactionId,
      amount: this.amount,
      status: this.status,
      notificationType: this.notificationType,
    };
  }
}
