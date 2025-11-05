import request from 'supertest';
import app from '../src/app.js';
import knex from '../src/db.js';
import * as lendsqr from '../src/services/lendsqrService.js';

beforeEach(async () => {
  await knex('transactions').del();
  await knex('wallets').del();
  await knex('users').del();
});

test('create user - not blacklisted', async () => {
  jest.spyOn(lendsqr, 'isBlacklistedByLendsqr').mockResolvedValue(false);
  const res = await request(app).post('/users').send({ email: 'a@example.com', firstName: 'A', lastName: 'User' });
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');
});

test('create user - blacklisted', async () => {
  jest.spyOn(lendsqr, 'isBlacklistedByLendsqr').mockResolvedValue(true);
  const res = await request(app).post('/users').send({ email: 'b@example.com', firstName: 'B', lastName: 'User' });
  expect(res.status).toBe(403);
});
