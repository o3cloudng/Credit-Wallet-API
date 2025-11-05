import express, { Request, Response } from 'express';
import routes from './routes';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';


dotenv.config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());

app.use("/", (req: Request, res: Response) => {
  res.send("Welcome to the Credit Wallet Service API - Lendsqr");
});
app.use("/api", routes);
// app.use(routes);


// error handler (simple)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'server error' });
});

export default app;
