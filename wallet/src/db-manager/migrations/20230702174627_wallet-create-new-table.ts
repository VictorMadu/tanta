import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema('public').createTable('Wallet', (table) => {
    table.string('walletId').primary({
      constraintName: 'Wallet__primary-key',
    });
    table.string('userId');
    table.bigInteger('balanceValue');
    table.string('balanceCurrency');
    table.integer('lastTransactionVersion');
    table.timestamp('createdAt', { useTz: true });
    table.boolean('version');
    table.unique(['walletId', 'version'], {
      indexName: 'Wallet__transaction-control',
    });
  });
}

// WARNING: Backup before rollback
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('Wallet');
}
