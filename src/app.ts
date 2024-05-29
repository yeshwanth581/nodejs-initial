import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import router from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());
app.use(cors());

app.use('/api/v1', router);

app.use(errorHandler);

export default app;
