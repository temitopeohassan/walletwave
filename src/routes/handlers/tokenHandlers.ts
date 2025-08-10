import { Request, Response } from 'express';
import { tokenService } from '../../services/tokenService';
import { getTokensByNetwork, isValidERC20Address } from '../../config/tokens';

export const getSupportedTokens = async (req: Request, res: Response) => {
  try {
    const { network } = req.params;
    
    if (!network) {
      return res.status(400).json({ error: 'Network parameter is required' });
    }

    const tokens = getTokensByNetwork(network);
    
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
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get supported tokens', message: err.message });
  }
};

export const getTokenInfo = async (req: Request, res: Response) => {
  try {
    const { symbol, network } = req.params;
    
    if (!symbol || !network) {
      return res.status(400).json({ error: 'Token symbol and network are required' });
    }

    const tokenInfo = await tokenService.getTokenInfo(symbol, network);
    
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
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get token info', message: err.message });
  }
};

// New handler for getting token info by address
export const getTokenInfoByAddress = async (req: Request, res: Response) => {
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
    if (!isValidERC20Address(address)) {
      return res.status(400).json({ error: 'Invalid ERC20 address format' });
    }

    const tokenInfo = await tokenService.getTokenInfoByAddress(address, network);
    
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
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get token info by address', message: err.message });
  }
};

export const getNetworkStatus = async (req: Request, res: Response) => {
  try {
    const { network } = req.params;
    
    if (!network) {
      return res.status(400).json({ error: 'Network parameter is required' });
    }

    const isOnline = await tokenService.getNetworkStatus(network);
    
    res.json({
      network,
      status: isOnline ? 'online' : 'offline',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get network status', message: err.message });
  }
};

export const estimateGas = async (req: Request, res: Response) => {
  try {
    const { from_address, to_address, token_identifier, network, amount } = req.body;
    
    if (!from_address || !to_address || !token_identifier || !network || !amount) {
      return res.status(400).json({ 
        error: 'from_address, to_address, token_identifier, network, and amount are required' 
      });
    }

    const gasEstimate = await tokenService.estimateGasForTransfer(
      from_address,
      to_address,
      token_identifier,
      network,
      amount
    );

    res.json({
      from_address,
      to_address,
      token_identifier,
      network,
      amount,
      estimated_gas: gasEstimate
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to estimate gas', message: err.message });
  }
};

// New handler for clearing token cache
export const clearTokenCache = async (req: Request, res: Response) => {
  try {
    tokenService.clearDynamicTokenCache();
    
    res.json({
      message: 'Dynamic token cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear token cache', message: err.message });
  }
};

// New handler for getting cache statistics
export const getCacheStats = async (req: Request, res: Response) => {
  try {
    const stats = tokenService.getCacheStats();
    
    res.json({
      cache_stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get cache stats', message: err.message });
  }
}; 