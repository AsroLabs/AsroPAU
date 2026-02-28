import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import logger from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes/index';
import { execArgv } from 'node:process';


const app: Application = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Bienvenido a la API de Selectividad',
    version: '1.0.0',
    endpoints: {
      health: `${config.apiPrefix}/health`,
    },
  });
});

app.use(notFoundHandler);

app.use(errorHandler);

export default app;