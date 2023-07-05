import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TransactionControl } from 'src/lib/concurrency-control';
import { Exception } from 'src/lib/exception';
import { NotificationType } from '../notification/notification-type';
import { Currency } from '../wallet/currency';
import { Money } from '../wallet/money';
import { TransferringCode } from './exception.code';
import { Status, Transferring } from './transferring.entity';

interface Table {
  transferringId: string;
  senderWalletId: string;
  receiverWalletId: string;
  senderDebitTransactionId: string;
  receiverDebitTransactionId: string;
  amountValue: string;
  amountCurrency: string;
  status: string;
  notificationType: string;
  version: number;
}

const TableName = 'Transferring';

@Injectable()
export class TransferringRepository {
  constructor(private dbManagerService: DatabaseService) {}

  async save(transferring: Transferring) {
    try {
      const transactionControl = transferring
        .getTransactionControl()
        .clone()
        .incrementVersion();

      const row = this.toRow(transferring, transactionControl);
      const isNew = transactionControl.isNew();

      if (isNew) await this.insert(row);
      else await this.update(row);

      transferring.setTransactionControl(transactionControl);
    } catch (error) {
      throw new Exception(TransferringCode.PERSISTENCE);
    }
  }

  async load({ transferringId }: { transferringId: string }) {
    const row = await this.getDb().where({ transferringId }).first();

    if (row == null) return null;
    else return this.toEntity(row);
  }

  private getDb() {
    return this.dbManagerService.database<Table>(TableName);
  }

  private async insert(row: Table) {
    await this.getDb().insert(row);
  }

  private async update(row: Table) {
    const { transferringId } = row;
    await this.getDb().where({ transferringId }).update(row);
  }

  private toRow(
    transferring: Transferring,
    transactionControl: TransactionControl,
  ): Table {
    const state = transferring.getState();

    return {
      transferringId: state.transferringId,
      senderWalletId: state.senderWalletId,
      receiverWalletId: state.receiverWalletId,
      senderDebitTransactionId: state.senderDebitTransactionId,
      receiverDebitTransactionId: state.receiverDebitTransactionId,
      amountValue: state.amount.getValue().toString(),
      amountCurrency: state.amount.getCurrency(),
      status: state.status,
      version: transactionControl.getVersion(),
      notificationType: state.notificationType,
    };
  }

  private toEntity(row: Table): Transferring {
    return new Transferring(
      row.transferringId,
      row.senderWalletId,
      row.receiverWalletId,
      row.senderDebitTransactionId,
      row.receiverDebitTransactionId,
      new Money(+row.amountValue, row.amountCurrency as Currency),
      row.status as Status,
      row.notificationType as NotificationType,
      TransactionControl.fromVersion(row.version),
    );
  }
}
