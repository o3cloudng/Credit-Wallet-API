import { Knex } from 'knex';

/**
 * Migration: Create users, wallets, and transactions tables.
 */
export async function up(knex: Knex): Promise<void> {
  // Enable UUID generation in MySQL
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').catch(() => {});

  // USERS TABLE
  await knex.schema.createTable('users', (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    t.string('email').notNullable().unique();
    t.string('first_name').notNullable();
    t.string('last_name').notNullable();
    t.string('password').notNullable();
    t.timestamps(true, true);
  });

  // WALLETS TABLE
  await knex.schema.createTable('wallets', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    t.uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    // store balance in kobo (integer) for precision
    t.bigInteger('balance_kobo').notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

  // TRANSACTIONS TABLE
  await knex.schema.createTable('transactions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    t.uuid('wallet_id')
      .notNullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');
    t.enum('type', ['fund', 'transfer_out', 'transfer_in', 'withdraw']).notNullable();
    t.bigInteger('amount_kobo').notNullable(); // always in kobo
    t.json('metadata').nullable();
    t.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('wallets');
  await knex.schema.dropTableIfExists('users');
}
