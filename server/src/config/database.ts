import type { Knex } from 'knex';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const knexConfig: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: resolve(__dirname, '../../migrations'),
    extension: 'ts',
  },
  seeds: {
    directory: resolve(__dirname, '../../seeds'),
    extension: 'ts',
  },
};

export default knexConfig;
