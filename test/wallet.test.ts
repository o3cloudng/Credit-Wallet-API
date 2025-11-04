import request from 'supertest';
import app from '../src/app';
import knex from '../src/db';
import * as lendsqr from '../src/services/lendsqrService';

let userA: any, userB: any;

beforeAll(async () => {
  jest.spyOn(lendsqr, 'isBlacklistedByLendsqr').mockResolvedValue(false);
  const ra = await request(app).post('/users').send({ email: 'a@example.com', firstName: 'A', lastName: 'User' });
  const rb = await request(app).post('/users').send({ email: 'b@example.com', firstName: 'B', lastName: 'User' });
  userA = ra.body;
  userB = rb.body;
});

afterAll(async () => {
  await knex('transactions').del();
  await knex('wallets').del();
  await knex('users').del();
});

test('fund and transfer flow', async () => {
  // fund A
  let res = await request(app).post('/fund').set('x-faux-token', String(userA.id)).send({ amount: 100 });
  expect(res.status).toBe(200);
  expect(res.body.balance).toBe(100);

  // transfer 30 to B
  res = await request(app).post('/transfer').set('x-faux-token', String(userA.id)).send({ toUserId: userB.id, amount: 30 });
  expect(res.status).toBe(200);
  expect(res.body.fromBalance).toBe(70);
  expect(res.body.toBalance).toBe(30);
});

test('withdraw insufficient', async () => {
  const res = await request(app).post('/withdraw').set('x-faux-token', String(userB.id)).send({ amount: 50 });
  expect(res.status).toBe(400);
});
