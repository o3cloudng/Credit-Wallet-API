import Knex from 'knex';
import knexConfig from '../knexfile';
import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';

// IMPORTANT: Use test config
const config = knexConfig[env as keyof typeof knexConfig];
if (!config) throw new Error(`No knex config for env ${env}`);
export const knex = Knex(config);

export async function migrateLatest() {
  await knex.migrate.latest();
}

export async function rollbackAll() {
  await knex.migrate.rollback(undefined, true);
  // optionally recreate
  await knex.migrate.latest();
}

export async function truncateAll() {
  // use knex-cleaner or implement manual truncation
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');
  const tables = ['transactions', 'wallets', 'users'];
  for (const t of tables) {
    await knex(t).truncate();
  }
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');
}
