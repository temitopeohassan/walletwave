export interface TokenConfig {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  network: 'base' | 'base-sepolia' | 'ethereum-sepolia';
  isNative?: boolean;
  abi?: string[];
}

export const TOKENS: Record<string, TokenConfig> = {
  // Base Mainnet Tokens
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    network: 'base',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  EURc: {
    symbol: 'EURc',
    name: 'Euro Coin',
    address: '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22',
    decimals: 6,
    network: 'base',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  cNGN: {
    symbol: 'cNGN',
    name: 'Celo Naira',
    address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
    decimals: 18,
    network: 'base',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  lZAR: {
    symbol: 'lZAR',
    name: 'Local ZAR',
    address: '0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb',
    decimals: 18,
    network: 'base',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  Anzen: {
    symbol: 'Anzen',
    name: 'Anzen',
    address: '0x5c7f7fe4766fe8f0fa9b41e2b41958d1e2b65a3e',
    decimals: 18,
    network: 'base',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  IDRX: {
    symbol: 'IDRX',
    name: 'IDRX',
    address: '0x8c9e6c40d34e02da92d6339f8f8a5d3b2b3b3b3b',
    decimals: 18,
    network: 'base',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  CADC: {
    symbol: 'CADC',
    name: 'CADC',
    address: '0x7d4e8e1d5c3c2b1a0f8e9d8c7b6a5f4e3d2c1b0',
    decimals: 18,
    network: 'base',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  
  // Base Sepolia Testnet Tokens
  'USDC-SEPOLIA': {
    symbol: 'USDC',
    name: 'USD Coin (Sepolia)',
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7c',
    decimals: 6,
    network: 'base-sepolia',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  'EURc-SEPOLIA': {
    symbol: 'EURc',
    name: 'Euro Coin (Sepolia)',
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7c',
    decimals: 6,
    network: 'base-sepolia',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  'cNGN-SEPOLIA': {
    symbol: 'cNGN',
    name: 'Celo Naira (Sepolia)',
    address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
    decimals: 18,
    network: 'base-sepolia',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  'lZAR-SEPOLIA': {
    symbol: 'lZAR',
    name: 'Local ZAR (Sepolia)',
    address: '0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb',
    decimals: 18,
    network: 'base-sepolia',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  'Anzen-SEPOLIA': {
    symbol: 'Anzen',
    name: 'Anzen (Sepolia)',
    address: '0x5c7f7fe4766fe8f0fa9b41e2b41958d1e2b65a3e',
    decimals: 18,
    network: 'base-sepolia',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  'IDRX-SEPOLIA': {
    symbol: 'IDRX',
    name: 'IDRX (Sepolia)',
    address: '0x8c9e6c40d34e02da92d6339f8f8a5d3b2b3b3b3b',
    decimals: 18,
    network: 'base-sepolia',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  'CADC-SEPOLIA': {
    symbol: 'CADC',
    name: 'CADC (Sepolia)',
    address: '0x7d4e8e1d5c3c2b1a0f8e9d8c7b6a5f4e3d2c1b0',
    decimals: 18,
    network: 'base-sepolia',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  
  // Ethereum Sepolia Testnet Tokens
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000', // Native token
    decimals: 18,
    network: 'ethereum-sepolia',
    isNative: true
  }
};

export const getTokensByNetwork = (network: string): TokenConfig[] => {
  return Object.values(TOKENS).filter(token => token.network === network);
};

export const getTokenBySymbol = (symbol: string, network?: string): TokenConfig | undefined => {
  const tokens = network 
    ? Object.values(TOKENS).filter(token => token.network === network)
    : Object.values(TOKENS);
  
  return tokens.find(token => token.symbol === symbol);
};

export const getNativeToken = (network: string): TokenConfig | undefined => {
  return Object.values(TOKENS).find(token => 
    token.network === network && token.isNative
  );
}; 