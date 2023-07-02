import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const config = {
  knex: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST as string,
      port: +(process.env.DB_PORT as string),
      user: process.env.DB_USERNAME as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_NAME as string,
      ssl: process.env.NODE_ENV === 'test' ? '' : process.env.SSL,
    },
    pool: {
      min: +(process.env.DB_MIN_POOLSIZE as string),
      max: +(process.env.DB_MAX_POOLSIZE as string),
      idleTimeoutMillis: +(process.env.DB_IDLE_TIMEOUT_IN_MILLISECS as string),
    },
    timezone: 'UTC',
  },
  port: process.env.PORT as string,
  env: process.env.NODE_ENV as 'test' | 'development' | 'production',
} as const;

export default config;
