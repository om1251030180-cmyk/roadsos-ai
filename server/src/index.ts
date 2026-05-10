import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { router as apiRouter } from './routes';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: '*',
  })
);
app.use(express.text({ type: ['application/json', 'application/*+json', '*/*'], limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${port}`);
});
