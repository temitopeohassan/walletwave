#!/usr/bin/env ts-node

/**
 * Script to create the first admin API key for WalletWave
 * Run this script once to set up your initial admin access
 * 
 * Usage: npm run create-admin-key
 * or: npx ts-node scripts/create-admin-key.ts
 */

import { connectMongoDB } from '../src/config/mongodb';
import { ApiKey } from '../src/models/ApiKey';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createAdminKey() {
  try {
    console.log('🔐 Creating initial admin API key for WalletWave...\n');

    // Connect to MongoDB
    await connectMongoDB();
    console.log('✅ Connected to MongoDB');

    // Check if admin key already exists
    const existingAdmin = await ApiKey.findOne({ permissions: 'admin:all' }).exec();
    if (existingAdmin) {
      console.log('⚠️  Admin API key already exists!');
      console.log(`   API Key: ${existingAdmin.apiKey}`);
      console.log('   You can use this existing key or delete it first to create a new one.');
      process.exit(0);
    }

    // Create admin API key
    const adminKey = new ApiKey({
      name: 'Initial Admin API Key',
      userId: 'admin',
      permissions: ['admin:all'],
      rateLimit: {
        requests: 10000, // Higher limit for admin
        windowMs: 900000 // 15 minutes
      }
    });

    await adminKey.save();

    console.log('🎉 Admin API key created successfully!\n');
    console.log('📋 IMPORTANT: Save these credentials securely!\n');
    console.log(`🔑 API Key: ${adminKey.apiKey}`);
    console.log(`🔐 API Secret: ${adminKey.apiSecret}\n`);
    console.log('⚠️  WARNING: The API secret will not be shown again!');
    console.log('   Store it securely and never commit it to version control.\n');
    
    console.log('🚀 You can now use this admin key to:');
    console.log('   - Create additional API keys for users');
    console.log('   - Access all protected endpoints');
    console.log('   - Manage the system\n');

    console.log('📖 Next steps:');
    console.log('   1. Test your admin key with a simple API call');
    console.log('   2. Create user-specific API keys with limited permissions');
    console.log('   3. Refer to API_AUTHENTICATION.md for usage examples');

  } catch (error) {
    console.error('❌ Error creating admin API key:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  createAdminKey()
    .then(() => {
      console.log('\n✅ Setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error);
      process.exit(1);
    });
}
