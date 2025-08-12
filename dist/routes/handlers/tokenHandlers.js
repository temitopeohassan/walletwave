"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheStats = exports.clearTokenCache = exports.estimateGas = exports.getNetworkStatus = exports.getTokenInfoByAddress = exports.getTokenInfo = exports.getSupportedTokens = void 0;
const tokenService_1 = require("../../services/tokenService");
const tokens_1 = require("../../config/tokens");
const getSupportedTokens = async (req, res) => {
    try {
        const { network } = req.params;
        if (!network) {
            return res.status(400).json({ error: 'Network parameter is required' });
        }
        const tokens = (0, tokens_1.getTokensByNetwork)(network);
        res.json({
            network,
            tokens: tokens.map(token => ({
                symbol: token.symbol,
                name: token.name,
                address: token.address,
                decimals: token.decimals,
                isNative: token.isNative || false,
                isDynamic: token.isDynamic || false
            })),
            supportsDynamicTokens: network === 'base' || network === 'base-sepolia'
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get supported tokens', message: err.message });
    }
};
exports.getSupportedTokens = getSupportedTokens;
const getTokenInfo = async (req, res) => {
    try {
        const { symbol, network } = req.params;
        if (!symbol || !network) {
            return res.status(400).json({ error: 'Token symbol and network are required' });
        }
        const tokenInfo = await tokenService_1.tokenService.getTokenInfo(symbol, network);
        if (!tokenInfo) {
            return res.status(404).json({ error: 'Token not found' });
        }
        res.json({
            symbol: tokenInfo.symbol,
            name: tokenInfo.name,
            address: tokenInfo.address,
            decimals: tokenInfo.decimals,
            network: tokenInfo.network,
            isNative: tokenInfo.isNative || false,
            isDynamic: tokenInfo.isDynamic || false
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get token info', message: err.message });
    }
};
exports.getTokenInfo = getTokenInfo;
// New handler for getting token info by address
const getTokenInfoByAddress = async (req, res) => {
    try {
        const { address, network } = req.params;
        if (!address || !network) {
            return res.status(400).json({ error: 'Token address and network are required' });
        }
        // Validate that this is a Base network for dynamic token support
        if (network !== 'base' && network !== 'base-sepolia') {
            return res.status(400).json({
                error: 'Dynamic token discovery is only supported on Base networks'
            });
        }
        // Validate address format
        if (!(0, tokens_1.isValidERC20Address)(address)) {
            return res.status(400).json({ error: 'Invalid ERC20 address format' });
        }
        const tokenInfo = await tokenService_1.tokenService.getTokenInfoByAddress(address, network);
        if (!tokenInfo) {
            return res.status(404).json({ error: 'Token not found or not a valid ERC20 contract' });
        }
        res.json({
            symbol: tokenInfo.symbol,
            name: tokenInfo.name,
            address: tokenInfo.address,
            decimals: tokenInfo.decimals,
            network: tokenInfo.network,
            isNative: tokenInfo.isNative || false,
            isDynamic: tokenInfo.isDynamic || false
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get token info by address', message: err.message });
    }
};
exports.getTokenInfoByAddress = getTokenInfoByAddress;
const getNetworkStatus = async (req, res) => {
    try {
        const { network } = req.params;
        if (!network) {
            return res.status(400).json({ error: 'Network parameter is required' });
        }
        const isOnline = await tokenService_1.tokenService.getNetworkStatus(network);
        res.json({
            network,
            status: isOnline ? 'online' : 'offline',
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get network status', message: err.message });
    }
};
exports.getNetworkStatus = getNetworkStatus;
const estimateGas = async (req, res) => {
    try {
        const { from_address, to_address, token_identifier, network, amount } = req.body;
        if (!from_address || !to_address || !token_identifier || !network || !amount) {
            return res.status(400).json({
                error: 'from_address, to_address, token_identifier, network, and amount are required'
            });
        }
        const gasEstimate = await tokenService_1.tokenService.estimateGasForTransfer(from_address, to_address, token_identifier, network, amount);
        res.json({
            from_address,
            to_address,
            token_identifier,
            network,
            amount,
            estimated_gas: gasEstimate
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to estimate gas', message: err.message });
    }
};
exports.estimateGas = estimateGas;
// New handler for clearing token cache
const clearTokenCache = async (req, res) => {
    try {
        tokenService_1.tokenService.clearDynamicTokenCache();
        res.json({
            message: 'Dynamic token cache cleared successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to clear token cache', message: err.message });
    }
};
exports.clearTokenCache = clearTokenCache;
// New handler for getting cache statistics
const getCacheStats = async (req, res) => {
    try {
        const stats = tokenService_1.tokenService.getCacheStats();
        res.json({
            cache_stats: stats,
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get cache stats', message: err.message });
    }
};
exports.getCacheStats = getCacheStats;
