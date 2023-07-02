import { Injectable } from '@nestjs/common';
import { DbManagerService } from 'src/db-manager/db-manager.service';
import { TransactionControl } from 'src/lib/concurrency-control';
import { DateTime } from 'src/lib/date-time';
import { Exception } from 'src/lib/exception';
import { Pagination } from 'src/lib/pagination';
import { Currency } from './currency';
import { ExceptionCode } from './exception-code';
import { Money } from './money';
import { Wallet } from './wallet.entity';

interface Table {
  walletId: string;
  userId: string;
  createdAt: Date;
  balanceValue: string;
  balanceCurrency: string;
  lastTransactionVersion: number;
  version: boolean;
}

const TableName = 'Wallet';

@Injectable()
export class WalletRepository {
  constructor(private dbManagerService: DbManagerService) {}

  async save(wallet: Wallet) {
    try {
      const transactionControl = wallet
        .getTransactionControl()
        .clone()
        .incrementVersion();

      const row = this.toRow(wallet, transactionControl);
      const isNew = transactionControl.isNew();

      if (isNew) await this.insert(row);
      else await this.update(row);

      wallet.setTransactionControl(transactionControl);
    } catch (error) {
      throw new Exception(ExceptionCode.PERSISTENCE);
    }
  }

  async getWalletsByUser({
    userId,
    pagination,
  }: {
    userId: string;
    pagination: Pagination;
  }): Promise<Wallet[]> {
    const rows = await this.getDb()
      .where({ userId })
      .orderBy('createdAt', 'asc')
      .offset(pagination.offset)
      .limit(pagination.limit);

    return rows.map((row) => this.toEntity(row));
  }

  async getWalletById({ walletId }: { walletId: string }): Promise<Wallet> {
    const row = await this.getDb().where({ walletId }).first();

    if (row == null) throw new Exception(ExceptionCode.NOT_FOUND);
    else return this.toEntity(row);
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

  private toRow(wallet: Wallet, transactionControl: TransactionControl): Table {
    const state = Wallet.getState(wallet);

    return {
      walletId: state.walletId,
      userId: state.userId,
      balanceValue: state.balance.getValue().toString(),
      balanceCurrency: state.balance.getCurrency(),
      lastTransactionVersion: state.lastTransactionVersion,
      createdAt: state.createdAt.toDate(),
      version: transactionControl.isNew(),
    };
  }

  private toEntity(row: Table): Wallet {
    return new Wallet(
      row.walletId,
      row.userId,
      new DateTime(row.createdAt),
      new Money(+row.balanceValue, row.balanceCurrency as Currency),
      row.lastTransactionVersion,
      TransactionControl.fromState(row.version),
    );
  }
}
