import request from 'supertest';
import app from '../src/app.js';
import { createUser, fundWallet } from './factories.js';
import { knex } from './db.js';

describe('Transfer API', () => {
  let sender: any;
  let receiver: any;

  beforeEach(async () => {
    // create fresh users for each test
    sender = await createUser({ email: `sender_${Date.now()}@test.com` });
    receiver = await createUser({ email: `receiver_${Date.now()}@test.com` });
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it('transfers funds successfully (happy path)', async () => {
    // fund sender wallet
    await fundWallet(sender.user.id, 500.0);

    const res = await request(app)
      .post('/api/transfer')
      .send({
        sender_id: sender.user.id,
        receiver_id: receiver.user.id,
        amount: 150.0
      })
      .expect(200);

    expect(res.body).toHaveProperty('message', 'Transfer successful');
    expect(res.body).toHaveProperty('amount', 150);

    // assert balances in DB
    const senderWallet = await knex('wallets').where({ user_id: sender.user.id }).first();
    const receiverWallet = await knex('wallets').where({ user_id: receiver.user.id }).first();

    expect(Number(senderWallet.balance)).toBeCloseTo(350.0);
    expect(Number(receiverWallet.balance)).toBeCloseTo(150.0);

    // transaction was logged
    const txs = await knex('transactions').where({ sender_id: sender.user.id, receiver_id: receiver.user.id });
    expect(txs.length).toBe(1);
    expect(Number(txs[0].amount)).toBeCloseTo(150.0);
    expect(txs[0].type).toBe('transfer');
  });

  it('fails when insufficient funds', async () => {
    // sender has 0
    const res = await request(app)
      .post('/api/transfer')
      .send({
        sender_id: sender.user.id,
        receiver_id: receiver.user.id,
        amount: 1000.0
      })
      .expect(400);

    expect(res.body).toHaveProperty('error');
    // ensure no transaction
    const txs = await knex('transactions');
    expect(txs.length).toBe(0);
  });

  it('fails when transferring to self', async () => {
    await fundWallet(sender.user.id, 200);
    const res = await request(app)
      .post('/api/transfer')
      .send({
        sender_id: sender.user.id,
        receiver_id: sender.user.id,
        amount: 50
      })
      .expect(400);

    expect(res.body).toHaveProperty('error', 'Cannot transfer to self');
  });

  it('fails when receiver does not exist', async () => {
    await fundWallet(sender.user.id, 200);
    const res = await request(app)
      .post('/api/transfer')
      .send({
        sender_id: sender.user.id,
        receiver_id: 999999, // non-existent
        amount: 50
      })
      .expect(400);

    expect(res.body).toHaveProperty('error');
  });
});
