import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IApiKey extends Document {
  name: string;
  apiKey: string;
  apiSecret: string;
  userId: string;
  isActive: boolean;
  permissions: string[];
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  lastUsed: Date;
  createdAt: Date;
  expiresAt?: Date;
  
  // Methods
  generateApiKey(): string;
  generateApiSecret(): string;
  validateApiSecret(secret: string): boolean;
  isExpired(): boolean;
  hasPermission(permission: string): boolean;
}

const apiKeySchema = new Schema<IApiKey>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  apiKey: {
    type: String,
    unique: true,
    index: true
  },
  apiSecret: {
    type: String
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: [{
    type: String,
    enum: [
      'wallet:create',
      'wallet:read',
      'wallet:update',
      'wallet:delete',
      'address:create',
      'address:read',
      'address:update',
      'address:delete',
      'transaction:read',
      'transaction:create',
      'transaction:update',
      'token:read',
      'admin:all'
    ]
  }],
  rateLimit: {
    requests: {
      type: Number,
      default: 1000,
      min: 1
    },
    windowMs: {
      type: Number,
      default: 900000, // 15 minutes
      min: 60000 // 1 minute
    }
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: false
  }
});

// Generate a secure API key
apiKeySchema.methods.generateApiKey = function(): string {
  return `wk_${crypto.randomBytes(32).toString('hex')}`;
};

// Generate a secure API secret
apiKeySchema.methods.generateApiSecret = function(): string {
  return crypto.randomBytes(64).toString('hex');
};

// Validate API secret
apiKeySchema.methods.validateApiSecret = function(secret: string): boolean {
  return this.apiSecret === secret;
};

// Check if API key is expired
apiKeySchema.methods.isExpired = function(): boolean {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Check if API key has specific permission
apiKeySchema.methods.hasPermission = function(permission: string): boolean {
  return this.permissions.includes(permission) || this.permissions.includes('admin:all');
};

// Pre-save middleware to generate API key and secret if not provided
apiKeySchema.pre('save', function(next) {
  if (!this.apiKey) {
    this.apiKey = this.generateApiKey();
  }
  if (!this.apiSecret) {
    this.apiSecret = this.generateApiSecret();
  }
  next();
});

// Post-save validation to ensure required fields exist
apiKeySchema.post('save', function(doc) {
  if (!doc.apiKey || !doc.apiSecret) {
    throw new Error('API key and secret are required after save');
  }
});

// Index for performance
apiKeySchema.index({ apiKey: 1, isActive: 1 });
apiKeySchema.index({ userId: 1, isActive: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ApiKey = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
