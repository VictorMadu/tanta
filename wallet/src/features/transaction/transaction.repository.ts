import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TransactionControl } from 'src/lib/concurrency-control';
import { DateTime } from 'src/lib/date-time';
import { Exception } from 'src/lib/exception';
import { Pagination } from 'src/lib/pagination';
import { Currency } from 'src/features/wallet/currency';
import { Money } from 'src/features/wallet/money';
import { TransactionCode } from './exception-code';
import { TransactionType } from './transaction-type';
import { Transaction } from './transaction.entity';

interface Table {
  transactionId: string;
  walletId: string;
  amountValue: string;
  amountCurrency: string;
  type: string;
  createdAt: Date;
  version: number;
}

const TableName = 'Transaction';

@Injectable()
export class TransactionRepository {
  constructor(private dbManagerService: DatabaseService) {}

  async save(transaction: Transaction) {
    try {
      const transactionControl = transaction
        .getTransactionControl()
        .clone()
        .incrementVersion();

      const row = this.toRow(transaction, transactionControl);
      await this.insert(row);

      transaction.setTransactionControl(transactionControl);
    } catch (error) {
      throw new Exception(TransactionCode.PERSISTENCE);
    }
  }

  async getLastIfExistsBy({ walletId }: { walletId: string }) {
    const row = await this.getDb()
      .where({ walletId })
      .orderBy('createdAt', 'asc')
      .first();

    if (row == null) return null;
    else return this.toEntity(row);
  }

  async getAllInAscOrderAfter({ version }: { version: number }) {
    const rows = await this.getDb()
      .where('version', '>', version)
      .orderBy('createdAt', 'asc');

    return rows.map((row) => this.toEntity(row));
  }

  private getDb() {
    return this.dbManagerService.database<Table>(TableName);
  }

  private async insert(row: Table) {
    await this.getDb().insert(row);
  }

  private async update(row: Table) {
    const { walletId } = row;
    await this.getDb().where({ walletId }).update(row);
  }

  private toRow(
    transaction: Transaction,
    transactionControl: TransactionControl,
  ): Table {
    const state = transaction.getState();

    return {
      walletId: state.walletId,
      transactionId: state.transactionId,
      amountValue: state.amount.getValue().toString(),
      amountCurrency: state.amount.getCurrency(),
      type: state.type,
      createdAt: state.createdAt.toDate(),
      version: transactionControl.getVersion(),
    };
  }

  private toEntity(row: Table): Transaction {
    return new Transaction(
      row.transactionId,
      row.walletId,
      new Money(+row.amountValue, row.amountCurrency as Currency),
      row.type as TransactionType,
      new DateTime(row.createdAt),
      TransactionControl.fromVersion(row.version),
    );
  }
}
