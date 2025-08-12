"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKey = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const apiKeySchema = new mongoose_1.Schema({
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
apiKeySchema.methods.generateApiKey = function () {
    return `wk_${crypto_1.default.randomBytes(32).toString('hex')}`;
};
// Generate a secure API secret
apiKeySchema.methods.generateApiSecret = function () {
    return crypto_1.default.randomBytes(64).toString('hex');
};
// Validate API secret
apiKeySchema.methods.validateApiSecret = function (secret) {
    return this.apiSecret === secret;
};
// Check if API key is expired
apiKeySchema.methods.isExpired = function () {
    if (!this.expiresAt)
        return false;
    return new Date() > this.expiresAt;
};
// Check if API key has specific permission
apiKeySchema.methods.hasPermission = function (permission) {
    return this.permissions.includes(permission) || this.permissions.includes('admin:all');
};
// Pre-save middleware to generate API key and secret if not provided
apiKeySchema.pre('save', function (next) {
    if (!this.apiKey) {
        this.apiKey = this.generateApiKey();
    }
    if (!this.apiSecret) {
        this.apiSecret = this.generateApiSecret();
    }
    next();
});
// Post-save validation to ensure required fields exist
apiKeySchema.post('save', function (doc) {
    if (!doc.apiKey || !doc.apiSecret) {
        throw new Error('API key and secret are required after save');
    }
});
// Index for performance
apiKeySchema.index({ apiKey: 1, isActive: 1 });
apiKeySchema.index({ userId: 1, isActive: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.ApiKey = mongoose_1.default.model('ApiKey', apiKeySchema);
