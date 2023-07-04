import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TransactionControl } from 'src/lib/concurrency-control';
import { DateTime } from 'src/lib/date-time';
import { Exception } from 'src/lib/exception';
import { Pagination } from 'src/lib/pagination';
import { BalanceType } from './balance-type';
import { Currency } from './currency';
import { WalletCode } from './exception-code';
import { Money } from './money';
import { Wallet } from './wallet.entity';

interface Table {
  walletId: string;
  userId: string;
  createdAt: Date;
  balanceValue: string;
  balanceCurrency: string;
  balanceType: boolean;
  lastTransactionVersion: number;
  version: boolean;
}

const TableName = 'Wallet';

@Injectable()
export class WalletRepository {
  constructor(private databaseService: DatabaseService) {}

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
      throw new Exception(WalletCode.PERSISTENCE);
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

    if (row == null) throw new Exception(WalletCode.NOT_FOUND);
    else return this.toEntity(row);
  }

  private getDb() {
    return this.databaseService.database<Table>(TableName);
  }

  private async insert(row: Table) {
    await this.getDb().insert(row);
  }

  private async update(row: Table) {
    const { walletId } = row;
    await this.getDb().where({ walletId }).update(row);
  }

  private toRow(wallet: Wallet, transactionControl: TransactionControl): Table {
    const state = wallet.getState();

    return {
      walletId: state.walletId,
      userId: state.userId,
      balanceValue: state.balance.getValue().toString(),
      balanceCurrency: state.balance.getCurrency(),
      balanceType: state.balanceType === BalanceType.IDEAL,
      lastTransactionVersion: state.lastTransactionVersion,
      createdAt: state.createdAt.toDate(),
      version: transactionControl.isNew(),
    };
  }

  private toEntity(row: Table): Wallet {
    return new Wallet(
      row.walletId,
      row.userId,
      new Money(+row.balanceValue, row.balanceCurrency as Currency),
      row.balanceType ? BalanceType.IDEAL : BalanceType.OVERDRAFT,
      row.lastTransactionVersion,
      new DateTime(row.createdAt),
      TransactionControl.fromState(row.version),
    );
  }
}
