"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const ethers_1 = require("ethers");
const tokens_1 = require("../config/tokens");
class TokenService {
    constructor() {
        this.providers = new Map();
        this.dynamicTokenCache = new Map();
        this.initializeProviders();
    }
    initializeProviders() {
        const networks = {
            'base': process.env.BASE_RPC_URL,
            'base-sepolia': process.env.BASE_TESTNET_RPC_URL,
            'ethereum-sepolia': process.env.ETHEREUM_SEPOLIA_RPC_URL
        };
        for (const [network, rpcUrl] of Object.entries(networks)) {
            if (rpcUrl) {
                this.providers.set(network, new ethers_1.ethers.JsonRpcProvider(rpcUrl));
            }
        }
    }
    getProvider(network) {
        const provider = this.providers.get(network);
        if (!provider) {
            throw new Error(`No provider configured for network: ${network}`);
        }
        return provider;
    }
    // Enhanced method to get or create token config for any ERC20 address
    async getOrCreateTokenConfig(tokenIdentifier, network) {
        // First, try to find by symbol
        let token = (0, tokens_1.getTokenBySymbol)(tokenIdentifier, network);
        // If not found by symbol, try by address
        if (!token && (0, tokens_1.isValidERC20Address)(tokenIdentifier)) {
            token = (0, tokens_1.getTokenByAddress)(tokenIdentifier, network);
        }
        // If still not found and it's a valid address on Base networks, create dynamic config
        if (!token && (0, tokens_1.isValidERC20Address)(tokenIdentifier) &&
            (network === 'base' || network === 'base-sepolia')) {
            const cacheKey = `${network}:${tokenIdentifier.toLowerCase()}`;
            // Check cache first
            if (this.dynamicTokenCache.has(cacheKey)) {
                return this.dynamicTokenCache.get(cacheKey);
            }
            // Create new dynamic token config
            token = (0, tokens_1.createDynamicTokenConfig)(tokenIdentifier, network);
            // Try to fetch real token information from blockchain
            try {
                const provider = this.getProvider(network);
                const contract = new ethers_1.ethers.Contract(tokenIdentifier, tokens_1.ERC20_ABI, provider);
                // Fetch token metadata
                const [name, symbol, decimals] = await Promise.all([
                    contract.name().catch(() => 'Unknown Token'),
                    contract.symbol().catch(() => 'UNKNOWN'),
                    contract.decimals().catch(() => 18)
                ]);
                // Update token config with real data
                token.name = name;
                token.symbol = symbol;
                token.decimals = decimals;
                // Cache the resolved token
                this.dynamicTokenCache.set(cacheKey, token);
            }
            catch (error) {
                console.warn(`Failed to fetch metadata for token ${tokenIdentifier} on ${network}:`, error);
                // Keep default values if metadata fetch fails
            }
        }
        if (!token) {
            throw new Error(`Token ${tokenIdentifier} not supported on network ${network}`);
        }
        return token;
    }
    async getTokenBalance(address, tokenIdentifier, network) {
        const token = await this.getOrCreateTokenConfig(tokenIdentifier, network);
        const provider = this.getProvider(network);
        if (token.isNative) {
            // For native tokens like ETH
            const balance = await provider.getBalance(address);
            return balance.toString();
        }
        else {
            // For ERC-20 tokens (including dynamic ones)
            const contract = new ethers_1.ethers.Contract(token.address, token.abi, provider);
            const balance = await contract.balanceOf(address);
            return balance.toString();
        }
    }
    async getAllTokenBalances(address, network) {
        const tokens = (0, tokens_1.getTokensByNetwork)(network);
        const balances = {};
        for (const token of tokens) {
            try {
                balances[token.symbol.toLowerCase()] = await this.getTokenBalance(address, token.symbol, network);
            }
            catch (error) {
                console.error(`Error fetching balance for ${token.symbol}:`, error);
                balances[token.symbol.toLowerCase()] = '0';
            }
        }
        return balances;
    }
    async validateToken(tokenIdentifier, network) {
        try {
            await this.getOrCreateTokenConfig(tokenIdentifier, network);
            return true;
        }
        catch {
            return false;
        }
    }
    getSupportedTokens(network) {
        return (0, tokens_1.getTokensByNetwork)(network);
    }
    // New method to get token info for any ERC20 address
    async getTokenInfoByAddress(address, network) {
        try {
            if (!(0, tokens_1.isValidERC20Address)(address)) {
                return null;
            }
            return await this.getOrCreateTokenConfig(address, network);
        }
        catch (error) {
            console.error(`Error getting token info for address ${address}:`, error);
            return null;
        }
    }
    async estimateGasForTransfer(fromAddress, toAddress, tokenIdentifier, network, amount) {
        const token = await this.getOrCreateTokenConfig(tokenIdentifier, network);
        const provider = this.getProvider(network);
        if (token.isNative) {
            // For native ETH transfers
            const tx = {
                from: fromAddress,
                to: toAddress,
                value: ethers_1.ethers.parseEther(amount)
            };
            return (await provider.estimateGas(tx)).toString();
        }
        else {
            // For ERC-20 transfers (including dynamic ones)
            const contract = new ethers_1.ethers.Contract(token.address, [
                'function transfer(address to, uint256 amount) returns (bool)'
            ], provider);
            const parsedAmount = ethers_1.ethers.parseUnits(amount, token.decimals);
            return (await contract.transfer.estimateGas(toAddress, parsedAmount)).toString();
        }
    }
    async getTokenInfo(tokenSymbol, network) {
        try {
            return await this.getOrCreateTokenConfig(tokenSymbol, network);
        }
        catch {
            return null;
        }
    }
    formatTokenAmount(amount, tokenIdentifier, network) {
        // This method needs to be updated to handle dynamic tokens
        // For now, we'll use a default approach
        try {
            const parsedAmount = ethers_1.ethers.parseUnits(amount, 18); // Default to 18 decimals
            return ethers_1.ethers.formatUnits(parsedAmount, 18);
        }
        catch (error) {
            throw new Error(`Invalid amount format for token ${tokenIdentifier}`);
        }
    }
    async getNetworkStatus(network) {
        try {
            const provider = this.getProvider(network);
            await provider.getBlockNumber();
            return true;
        }
        catch (error) {
            console.error(`Network ${network} is not accessible:`, error);
            return false;
        }
    }
    // New method to clear dynamic token cache
    clearDynamicTokenCache() {
        this.dynamicTokenCache.clear();
    }
    // New method to get cache statistics
    getCacheStats() {
        const networks = new Set();
        for (const key of this.dynamicTokenCache.keys()) {
            const [network] = key.split(':');
            networks.add(network);
        }
        return {
            size: this.dynamicTokenCache.size,
            networks: Array.from(networks)
        };
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
