# WalletWave Multi-Token Support

WalletWave now supports multiple cryptocurrencies across different networks. This document outlines the supported tokens and networks.

## Supported Networks

### Base Network
- **Base Mainnet**: Production network for USDC and USDT
- **Base Sepolia**: Testnet for USDC and USDT testing

### Ethereum Network
- **Ethereum Sepolia**: Testnet for ETH, cNGN, and lZAR

## Supported Tokens

### Base Mainnet
| Token | Symbol | Contract Address | Decimals | Type |
|-------|--------|------------------|----------|------|
| USD Coin | USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 | ERC-20 |
| Tether USD | USDT | `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2` | 6 | ERC-20 |

### Base Sepolia Testnet
| Token | Symbol | Contract Address | Decimals | Type |
|-------|--------|------------------|----------|------|
| USD Coin | USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7c` | 6 | ERC-20 |
| Tether USD | USDT | `0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2` | 6 | ERC-20 |

### Ethereum Sepolia Testnet
| Token | Symbol | Contract Address | Decimals | Type |
|-------|--------|------------------|----------|------|
| Ethereum | ETH | `0x0000000000000000000000000000000000000000` | 18 | Native |
| Celo Naira | cNGN | `0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889` | 18 | ERC-20 |
| Local ZAR | lZAR | `0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb` | 18 | ERC-20 |

## API Endpoints

### Token Information
- `GET /tokens/:network` - Get all supported tokens for a network
- `GET /tokens/:network/:symbol` - Get specific token information
- `GET /network/:network/status` - Check network connectivity
- `POST /estimate-gas` - Estimate gas for token transfers

### Balance and Transaction Management
- `POST /tools/get_address_balance` - Get token balances for an address
- `POST /tools/get_transaction_history` - Get transaction history
- `POST /tools/initiate_sweep` - Initiate token sweep
- `POST /tools/initiate_withdrawal` - Initiate token withdrawal

## Environment Variables

Add these environment variables to your `.env` file:

```env
# Base Network
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
BASE_TESTNET_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Ethereum Sepolia
ETHEREUM_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
```

## Usage Examples

### Get Token Balances
```bash
curl -X POST http://localhost:3000/tools/get_address_balance \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890123456789012345678901234567890",
    "network": "ethereum-sepolia"
  }'
```

### Get Supported Tokens
```bash
curl http://localhost:3000/tokens/ethereum-sepolia
```

### Estimate Gas for Transfer
```bash
curl -X POST http://localhost:3000/estimate-gas \
  -H "Content-Type: application/json" \
  -d '{
    "from_address": "0x1234567890123456789012345678901234567890",
    "to_address": "0x0987654321098765432109876543210987654321",
    "token_symbol": "ETH",
    "network": "ethereum-sepolia",
    "amount": "0.1"
  }'
```

## Token Configuration

The token configuration is centralized in `src/config/tokens.ts`. To add new tokens:

1. Add the token configuration to the `TOKENS` object
2. Include the contract address, decimals, and network
3. For native tokens, set `isNative: true`
4. For ERC-20 tokens, include the ABI for `balanceOf` function

## Network Support

Each network has its own RPC provider and token set. The system automatically:
- Routes requests to the correct network
- Validates tokens against the specified network
- Handles native vs ERC-20 token operations
- Provides network-specific gas estimation

## Security Considerations

- All token addresses are validated against the network
- Gas estimation includes safety checks
- Network connectivity is monitored
- Token validation prevents invalid operations

## Testing

To test the new token support:

1. Set up testnet RPC URLs
2. Use testnet faucets to get test tokens
3. Test balance queries and gas estimation
4. Verify network status endpoints

## Migration Notes

Existing USDC/USDT functionality remains unchanged. The new tokens are additive and don't affect existing operations. 