import { migrateLatest, truncateAll, knex } from './db';

beforeAll(async () => {
  await migrateLatest();
});

beforeEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  await knex.destroy();
});
