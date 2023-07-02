import { Injectable } from '@nestjs/common';
import knex, { Knex } from 'knex';
import config from '../../config';

@Injectable()
export class DbManagerService {
  public database: Knex;

  constructor() {
    this.database = knex(config.knex);
  }

  async cleanTestDatabase() {
    const allTables: Table[] = await this.database
      .withSchema('pg_catalog')
      .select('tablename')
      .from('pg_tables')
      .where('schemaname', 'public');

    const appTables = this.filterAppTables(allTables);

    await Promise.all(appTables.map((table) => this.truncate(table)));
  }

  private filterAppTables(tables: Table[]) {
    return tables.filter((table) => {
      return (
        table.tablename.includes('knex') === false &&
        table.tablename.includes('spatial_ref_sys') === false
      );
    });
  }

  private async truncate(table: Table) {
    await this.database(table.tablename).truncate();
  }
}

interface Table {
  tablename: string;
}
