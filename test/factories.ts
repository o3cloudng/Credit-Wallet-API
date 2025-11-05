import { knex } from './db';
import bcrypt from 'bcrypt';

export async function createUser(payload?: { full_name?: string; email?: string; password?: string }) {
  const full_name = payload?.full_name ?? 'Test User';
  const email = payload?.email ?? `user_${Date.now()}@example.com`;
  const password = payload?.password ?? 'password123';
  const hashed = await bcrypt.hash(password, 8);

  const [id] = await knex('users').insert({ full_name, email, password: hashed });
  // create wallet with default balance 0
  await knex('wallets').insert({ user_id: id, balance: 0 });
  const user = await knex('users').where({ id }).first();
  const wallet = await knex('wallets').where({ user_id: id }).first();
  return { user, wallet };
}

export async function fundWallet(user_id: number, amount: number) {
  const wallet = await knex('wallets').where({ user_id }).first();
  const newBalance = Number(wallet.balance) + amount;
  await knex('wallets').where({ user_id }).update({ balance: newBalance });
  return newBalance;
}
