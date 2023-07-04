import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema('public').createTable('Transaction', (table) => {
    table.string('transactionId').primary({
      constraintName: 'Transaction__primary-key',
    });
    table.string('walletId');
    table.bigInteger('amountValue');
    table.string('amountCurrency');
    table.string('type');
    table.timestamp('createdAt', { useTz: true });
    table.integer('version');
    table.unique(['transactionId', 'version'], {
      indexName: 'Transaction__transaction-control',
    });
  });
}

// WARNING: Backup before rollback
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('Transaction');
}
