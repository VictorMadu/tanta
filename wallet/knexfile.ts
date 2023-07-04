import type { Knex } from 'knex';
import config from './src/config';

const envConfig: Knex.Config = {
  client: 'pg',
  connection: config.knex.connection,
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/database/migrations',
  },
};

export default envConfig;
