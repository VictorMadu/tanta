import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .withSchema('public')
    .createTable('Transferring', (table) => {
      table.string('transferringId').primary({
        constraintName: 'Transferring__primary-key',
      });
      table.string('senderWalletId');
      table.string('receiverWalletId');
      table.string('senderDebitTransactionId');
      table.string('receiverDebitTransactionId');
      table.bigint('amountValue');
      table.string('amountCurrency');
      table.string('status');
      table.string('notificationType');
      table.integer('version');
      table.unique(['transferringId', 'version'], {
        indexName: 'Transferring__transaction-control',
      });
    });
}

// WARNING: Backup before rollback
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('Transferring');
}
