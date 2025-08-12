"use strict";
// src/api/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const mongodb_1 = require("../config/mongodb");
const redis_1 = require("../config/redis");
const walletHandlers_1 = require("../routes/handlers/walletHandlers");
const transactionHandlers_1 = require("../routes/handlers/transactionHandlers");
const addressHandlers_1 = require("../routes/handlers/addressHandlers");
const tokenHandlers_1 = require("../routes/handlers/tokenHandlers");
const apiKeyHandlers_1 = require("../routes/handlers/apiKeyHandlers");
const auth_1 = require("../middleware/auth");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
// Health check (public)
app.get('/', (req, res) => {
    res.send('✅ WalletWave Server is up and running');
});
// Connect to databases
(0, mongodb_1.connectMongoDB)();
(0, redis_1.connectRedis)();
// API Key Management Routes (Admin only)
app.post('/api/keys', (0, auth_1.requireAdmin)(), apiKeyHandlers_1.createApiKey);
app.get('/api/keys', (0, auth_1.authenticateApiKey)(), apiKeyHandlers_1.listApiKeys);
app.get('/api/keys/:id', (0, auth_1.authenticateApiKey)(), apiKeyHandlers_1.getApiKey);
app.put('/api/keys/:id', (0, auth_1.authenticateApiKey)(), apiKeyHandlers_1.updateApiKey);
app.delete('/api/keys/:id', (0, auth_1.authenticateApiKey)(), apiKeyHandlers_1.deleteApiKey);
app.post('/api/keys/:id/regenerate-secret', (0, auth_1.authenticateApiKey)(), apiKeyHandlers_1.regenerateApiSecret);
// Wallet Management Routes (Protected)
app.post('/tools/create_master_wallet', (0, auth_1.requirePermission)('wallet:create'), walletHandlers_1.createMasterWallet);
app.post('/tools/create_dedicated_address', (0, auth_1.requirePermission)('address:create'), walletHandlers_1.createDedicatedAddress);
app.post('/tools/get_address_balance', (0, auth_1.requirePermission)('address:read'), addressHandlers_1.getAddressBalance);
app.post('/tools/list_dedicated_addresses', (0, auth_1.requirePermission)('address:read'), addressHandlers_1.listDedicatedAddresses);
app.post('/tools/update_address_settings', (0, auth_1.requirePermission)('address:update'), addressHandlers_1.updateAddressSettings);
// Transaction Management Routes (Protected)
app.post('/tools/get_transaction_history', (0, auth_1.requirePermission)('transaction:read'), transactionHandlers_1.getTransactionHistory);
app.post('/tools/initiate_sweep', (0, auth_1.requirePermission)('transaction:create'), transactionHandlers_1.initiateSweep);
app.post('/tools/initiate_withdrawal', (0, auth_1.requirePermission)('transaction:create'), transactionHandlers_1.initiateWithdrawal);
app.post('/tools/get_transaction_details', (0, auth_1.requirePermission)('transaction:read'), transactionHandlers_1.getTransactionDetails);
// Token Management Routes (Public with optional auth for enhanced features)
app.get('/tokens/:network', auth_1.optionalAuth, tokenHandlers_1.getSupportedTokens);
app.get('/tokens/:network/:symbol', auth_1.optionalAuth, tokenHandlers_1.getTokenInfo);
app.get('/network/:network/status', auth_1.optionalAuth, tokenHandlers_1.getNetworkStatus);
app.post('/estimate-gas', (0, auth_1.requirePermission)('token:read'), tokenHandlers_1.estimateGas);
// Advanced Token Routes (Protected)
app.get('/tokens/:network/address/:address', (0, auth_1.requirePermission)('token:read'), tokenHandlers_1.getTokenInfoByAddress);
app.post('/tokens/cache/clear', (0, auth_1.requireAdmin)(), tokenHandlers_1.clearTokenCache);
app.get('/tokens/cache/stats', (0, auth_1.requireAdmin)(), tokenHandlers_1.getCacheStats);
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
exports.default = (0, serverless_http_1.default)(app);
