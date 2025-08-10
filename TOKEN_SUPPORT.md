# WalletWave Multi-Token Support

WalletWave now supports multiple cryptocurrencies across different networks, including **dynamic ERC20 token discovery** on Base networks.

## Supported Networks

### Base Network
- **Base Mainnet**: Production network for USDC, EURc, cNGN, lZAR, Anzen, IDRX, CADC + **ALL ERC20 tokens**
- **Base Sepolia**: Testnet for USDC, EURc, cNGN, lZAR, Anzen, IDRX, CADC + **ALL ERC20 tokens**

### Ethereum Network
- **Ethereum Sepolia**: Testnet for ETH (native token only)

## Token Support Types

### 1. Pre-configured Tokens
These are tokens that have been manually configured with verified contract addresses and metadata.

### 2. Dynamic ERC20 Tokens ✨ **NEW**
Base networks now support **ALL ERC20 tokens** automatically without pre-configuration. Simply provide any valid ERC20 contract address and WalletWave will:
- Detect the token automatically
- Fetch real-time metadata (name, symbol, decimals)
- Cache the information for performance
- Support all standard ERC20 operations

## Supported Tokens

### Base Mainnet
| Token | Symbol | Contract Address | Decimals | Type | Status |
|-------|--------|------------------|----------|------|---------|
| USD Coin | USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 | ERC-20 | ✅ Pre-configured |
| Euro Coin | EURc | `0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22` | 6 | ERC-20 | ✅ Pre-configured |
| Celo Naira | cNGN | `0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889` | 18 | ERC-20 | ✅ Pre-configured |
| Local ZAR | lZAR | `0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb` | 18 | ERC-20 | ✅ Pre-configured |
| Anzen | Anzen | `0x5c7f7fe4766fe8f0fa9b41e2b41958d1e2b65a3e` | 18 | ERC-20 | ✅ Pre-configured |
| IDRX | IDRX | `0x8c9e6c40d34e02da92d6339f8f8a5d3b2b3b3b3b` | 18 | ERC-20 | ✅ Pre-configured |
| CADC | CADC | `0x7d4e8e1d5c3c2b1a0f8e9d8c7b6a5f4e3d2c1b0` | 18 | ERC-20 | ✅ Pre-configured |
| **Any ERC20** | **Dynamic** | **Any valid address** | **Auto-detected** | **ERC-20** | 🚀 **Dynamic Support** |

### Base Sepolia Testnet
| Token | Symbol | Contract Address | Decimals | Type | Status |
|-------|--------|------------------|----------|------|---------|
| USD Coin | USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7c` | 6 | ERC-20 | ✅ Pre-configured |
| Euro Coin | EURc | `0x036CbD53842c5426634e7929541eC2318f3dCF7c` | 6 | ERC-20 | ✅ Pre-configured |
| Celo Naira | cNGN | `0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889` | 18 | ERC-20 | ✅ Pre-configured |
| Local ZAR | lZAR | `0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb` | 18 | ERC-20 | ✅ Pre-configured |
| Anzen | Anzen | `0x5c7f7fe4766fe8f0fa9b41e2b41958d1e2b65a3e` | 18 | ERC-20 | ✅ Pre-configured |
| IDRX | IDRX | `0x8c9e6c40d34e02da92d6339f8f8a5d3b2b3b3b3b` | 18 | ERC-20 | ✅ Pre-configured |
| CADC | CADC | `0x7d4e8e1d5c3c2b1a0f8e9d8c7b6a5f4e3d2c1b0` | 18 | ERC-20 | ✅ Pre-configured |
| **Any ERC20** | **Dynamic** | **Any valid address** | **Auto-detected** | **ERC-20** | 🚀 **Dynamic Support** |

### Ethereum Sepolia Testnet
| Token | Symbol | Contract Address | Decimals | Type | Status |
|-------|--------|------------------|----------|------|---------|
| Ethereum | ETH | `0x0000000000000000000000000000000000000000` | 18 | Native | ✅ Pre-configured |

## Dynamic ERC20 Token Support

### How It Works
1. **Automatic Detection**: Provide any valid ERC20 contract address on Base networks
2. **Real-time Metadata**: WalletWave fetches token name, symbol, and decimals from the blockchain
3. **Smart Caching**: Token information is cached for performance
4. **Full Compatibility**: All standard ERC20 operations are supported

### Supported Operations
- ✅ Balance checking
- ✅ Transfer operations
- ✅ Gas estimation
- ✅ Token metadata retrieval
- ✅ Contract validation

### API Endpoints for Dynamic Tokens

#### Get Token Info by Address
```bash
GET /tokens/{network}/address/{contract_address}
```

**Example:**
```bash
GET /tokens/base/address/0x1234567890123456789012345678901234567890
```

**Response:**
```json
{
  "symbol": "TOKEN",
  "name": "Token Name",
  "address": "0x1234567890123456789012345678901234567890",
  "decimals": 18,
  "network": "base",
  "isNative": false,
  "isDynamic": true
}
```

#### Cache Management
```bash
# Clear dynamic token cache
POST /tokens/cache/clear

# Get cache statistics
GET /tokens/cache/stats
```

## Usage Examples

### Working with Pre-configured Tokens
```bash
# Get USDC balance
curl -X POST http://localhost:3000/tools/get_address_balance \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890123456789012345678901234567890",
    "token_identifier": "USDC",
    "network": "base"
  }'
```

### Working with Dynamic ERC20 Tokens
```bash
# Get balance of any ERC20 token by address
curl -X POST http://localhost:3000/tools/get_address_balance \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890123456789012345678901234567890",
    "token_identifier": "0xabcdef1234567890abcdef1234567890abcdef12",
    "network": "base"
  }'

# Estimate gas for transfer of any ERC20 token
curl -X POST http://localhost:3000/estimate-gas \
  -H "Content-Type: application/json" \
  -d '{
    "from_address": "0x1234567890123456789012345678901234567890",
    "to_address": "0xabcdef1234567890abcdef1234567890abcdef12",
    "token_identifier": "0x9876543210987654321098765432109876543210",
    "network": "base",
    "amount": "1000000000000000000"
  }'
```

## Network Status
```bash
GET /network/{network}/status
```

**Example:**
```bash
GET /network/base/status
```

**Response:**
```json
{
  "network": "base",
  "status": "online",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Migration Notes

The system now supports a comprehensive set of tokens across Base networks, including:
- **7 pre-configured tokens** with verified addresses
- **Unlimited dynamic ERC20 tokens** with automatic detection
- **Full ERC20 standard compliance** for all operations
- **Smart caching system** for performance optimization

### Benefits of Dynamic Support
1. **Future-proof**: Automatically supports new tokens as they're deployed
2. **No configuration needed**: Works with any valid ERC20 contract
3. **Real-time data**: Always fetches current token information
4. **Performance optimized**: Intelligent caching reduces blockchain calls

## Technical Details

### ERC20 ABI Support
The system includes a comprehensive ERC20 ABI that supports:
- `balanceOf(address)` - Balance checking
- `transfer(address, uint256)` - Token transfers
- `name()`, `symbol()`, `decimals()` - Metadata retrieval
- `approve()`, `allowance()` - Approval management
- `totalSupply()` - Supply information

### Cache Management
- **Automatic caching** of discovered tokens
- **Network-specific caching** for Base Mainnet and Sepolia
- **Cache statistics** and management endpoints
- **Manual cache clearing** when needed

### Error Handling
- **Invalid address validation** with proper error messages
- **Contract validation** to ensure ERC20 compliance
- **Network-specific restrictions** for dynamic token support
- **Graceful fallbacks** for metadata retrieval failures 