import express from 'express';
import serverless from 'serverless-http';

const app = express();

app.get('/', (req, res) => {
  res.send('WalletWave API Server');
});

export const handler = serverless(app);
