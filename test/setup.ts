import knex from '../src/db';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await knex.migrate.latest();
});

afterAll(async () => {
  await knex.destroy();
});
