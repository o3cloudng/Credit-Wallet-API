import knex from 'knex';
// Note: You must ensure this import path is correct and has the .js extension if using NodeNext
import importedConfig from '../knexfile.js'; 

const environment = process.env.NODE_ENV || 'development';

// ➡️ This line selects the specific configuration needed:
const configForEnv = importedConfig[environment]; 

// Now pass the *specific* config to knex
const db = knex(configForEnv); 

export default db;


// import Knex from 'knex';
// import config from '../knexfile.js';
// const env = process.env.NODE_ENV || 'development';
// const knex = Knex(config[env] as any);
// export default knex;