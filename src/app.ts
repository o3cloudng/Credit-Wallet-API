import express from 'express';
import routes from './routes';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use("/api", routes);
// app.use(routes);

export default app;
