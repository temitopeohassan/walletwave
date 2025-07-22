import { Express } from 'express';
import { createMasterWalletHandler } from './createMasterWallet';

export const registerToolRoutes = (app: Express) => {
  app.post('/tools/create_master_wallet', createMasterWalletHandler);
  // Add more tool routes here...
};
