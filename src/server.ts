import app from './app.js';
import knex from './db.js';

const port = process.env.PORT || 3000;

const server = app.listen(port, async () => {
  console.log(`Server listening on ${port}`);
});

process.on('SIGINT', async () => {
  await knex.destroy();
  server.close(() => process.exit(0));
});
