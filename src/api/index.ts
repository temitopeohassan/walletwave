// src/api/index.ts

import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import serverless from 'serverless-http';

import { connectMongoDB } from '../config/mongodb';
import { connectRedis } from '../config/redis';
import {
  createMasterWallet,
  createDedicatedAddress,
} from '../routes/handlers/walletHandlers';

import {
  getTransactionHistory,
  initiateSweep,
  initiateWithdrawal,
  getTransactionDetails,
} from '../routes/handlers/transactionHandlers';

import {
  getAddressBalance,
  listDedicatedAddresses,
  updateAddressSettings,
} from '../routes/handlers/addressHandlers';

import {
  getSupportedTokens,
  getTokenInfo,
  getNetworkStatus,
  estimateGas,
  getTokenInfoByAddress,
  clearTokenCache,
  getCacheStats,
} from '../routes/handlers/tokenHandlers';

import {
  createApiKey,
  listApiKeys,
  getApiKey,
  updateApiKey,
  deleteApiKey,
  regenerateApiSecret,
} from '../routes/handlers/apiKeyHandlers';

import {
  authenticateApiKey,
  requirePermission,
  requirePermissions,
  requireAdmin,
  optionalAuth,
} from '../middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
app.use(bodyParser.json());

// Health check (public)
app.get('/', (req, res) => {
  res.send('✅ WalletWave Server is up and running');
});

// Connect to databases
connectMongoDB();
connectRedis();

// API Key Management Routes (Admin only)
app.post('/api/keys', requireAdmin(), createApiKey);
app.get('/api/keys', authenticateApiKey(), listApiKeys);
app.get('/api/keys/:id', authenticateApiKey(), getApiKey);
app.put('/api/keys/:id', authenticateApiKey(), updateApiKey);
app.delete('/api/keys/:id', authenticateApiKey(), deleteApiKey);
app.post('/api/keys/:id/regenerate-secret', authenticateApiKey(), regenerateApiSecret);

// Wallet Management Routes (Protected)
app.post('/tools/create_master_wallet', requirePermission('wallet:create'), createMasterWallet);
app.post('/tools/create_dedicated_address', requirePermission('address:create'), createDedicatedAddress);
app.post('/tools/get_address_balance', requirePermission('address:read'), getAddressBalance);
app.post('/tools/list_dedicated_addresses', requirePermission('address:read'), listDedicatedAddresses);
app.post('/tools/update_address_settings', requirePermission('address:update'), updateAddressSettings);

// Transaction Management Routes (Protected)
app.post('/tools/get_transaction_history', requirePermission('transaction:read'), getTransactionHistory);
app.post('/tools/initiate_sweep', requirePermission('transaction:create'), initiateSweep);
app.post('/tools/initiate_withdrawal', requirePermission('transaction:create'), initiateWithdrawal);
app.post('/tools/get_transaction_details', requirePermission('transaction:read'), getTransactionDetails);

// Token Management Routes (Public with optional auth for enhanced features)
app.get('/tokens/:network', optionalAuth, getSupportedTokens);
app.get('/tokens/:network/:symbol', optionalAuth, getTokenInfo);
app.get('/network/:network/status', optionalAuth, getNetworkStatus);
app.post('/estimate-gas', requirePermission('token:read'), estimateGas);

// Advanced Token Routes (Protected)
app.get('/tokens/:network/address/:address', requirePermission('token:read'), getTokenInfoByAddress);
app.post('/tokens/cache/clear', requireAdmin(), clearTokenCache);
app.get('/tokens/cache/stats', requireAdmin(), getCacheStats);

// Local dev server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🔧 WalletWave Server running locally on http://localhost:${PORT}`);
    console.log(`🔐 API Authentication: Required for most endpoints`);
    console.log(`📚 API Key Management: /api/keys (Admin only)`);
  });
}

// Serverless handler export for Vercel
export default serverless(app);

