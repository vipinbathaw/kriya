const { resolve } = require('path');

module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'kriya',
    password: process.env.DB_PASSWORD || 'kriya_password',
    database: process.env.DB_NAME || 'kriya_dev',
  },
  pool: { min: 2, max: 10 },
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
