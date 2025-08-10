export interface TokenConfig {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  network: 'base' | 'base-sepolia' | 'ethereum-sepolia';
  isNative?: boolean;
  abi?: string[];
  isDynamic?: boolean; // Indicates if this is a dynamically detected token
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

// Standard ERC20 ABI for dynamic token detection
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 amount)',
  'event Approval(address indexed owner, address indexed spender, uint256 amount)'
];

// Function to create a dynamic token config for any ERC20 address
export const createDynamicTokenConfig = (
  address: string, 
  network: 'base' | 'base-sepolia'
): TokenConfig => {
  return {
    symbol: 'UNKNOWN',
    name: 'Unknown Token',
    address: address.toLowerCase(),
    decimals: 18, // Default to 18, will be updated when fetched
    network: network,
    abi: ERC20_ABI,
    isDynamic: true
  };
};

// Function to check if an address is a valid ERC20 token
export const isValidERC20Address = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
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

export const getTokenByAddress = (address: string, network?: string): TokenConfig | undefined => {
  const normalizedAddress = address.toLowerCase();
  const tokens = network 
    ? Object.values(TOKENS).filter(token => token.network === network)
    : Object.values(TOKENS);
  
  return tokens.find(token => token.address.toLowerCase() === normalizedAddress);
};

export const getNativeToken = (network: string): TokenConfig | undefined => {
  return Object.values(TOKENS).find(token => 
    token.network === network && token.isNative
  );
}; 