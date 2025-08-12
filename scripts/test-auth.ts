#!/usr/bin/env ts-node

/**
 * Script to test the WalletWave authentication system
 * Run this after creating your admin API key to verify everything works
 * 
 * Usage: npm run test-auth
 * or: npx ts-node scripts/test-auth.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testAuthentication() {
  console.log('🧪 Testing WalletWave Authentication System...\n');

  try {
    // Test 1: Public endpoint (should work without auth)
    console.log('1️⃣ Testing public endpoint...');
    const publicResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Public endpoint works:', publicResponse.data);
    console.log('');

    // Test 2: Protected endpoint without auth (should fail)
    console.log('2️⃣ Testing protected endpoint without authentication...');
    try {
      await axios.post(`${BASE_URL}/tools/get_address_balance`, {
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      });
      console.log('❌ This should have failed!');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Protected endpoint correctly requires authentication');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 3: Protected endpoint with invalid auth (should fail)
    console.log('3️⃣ Testing protected endpoint with invalid credentials...');
    try {
      await axios.post(`${BASE_URL}/tools/get_address_balance`, 
        { address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' },
        {
          headers: {
            'x-api-key': 'invalid-key',
            'x-api-secret': 'invalid-secret'
          }
        }
      );
      console.log('❌ This should have failed!');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials correctly rejected');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 4: API key management endpoint (should work with admin key)
    console.log('4️⃣ Testing API key management endpoint...');
    console.log('   (This requires your admin API key)');
    
    const adminKey = process.env.ADMIN_API_KEY;
    const adminSecret = process.env.ADMIN_API_SECRET;
    
    if (!adminKey || !adminSecret) {
      console.log('⚠️  Set ADMIN_API_KEY and ADMIN_API_SECRET environment variables to test this');
      console.log('   Example:');
      console.log('   export ADMIN_API_KEY="wk_your_key_here"');
      console.log('   export ADMIN_API_SECRET="your_secret_here"');
    } else {
      try {
        const keysResponse = await axios.get(`${BASE_URL}/api/keys`, {
          headers: {
            'x-api-key': adminKey,
            'x-api-secret': adminSecret
          }
        });
        console.log('✅ API key management works with admin credentials');
        console.log('   Found', keysResponse.data.count, 'API keys');
      } catch (error: any) {
        console.log('❌ API key management failed:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    console.log('🎉 Authentication system test completed!');
    console.log('');
    console.log('📖 Next steps:');
    console.log('   1. Create user API keys with limited permissions');
    console.log('   2. Test different permission levels');
    console.log('   3. Test rate limiting');
    console.log('   4. Refer to API_AUTHENTICATION.md for examples');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testAuthentication()
    .then(() => {
      console.log('\n✅ All tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}
