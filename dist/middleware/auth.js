"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAdmin = exports.requirePermissions = exports.requirePermission = exports.authenticateApiKey = void 0;
const ApiKey_1 = require("../models/ApiKey");
const ioredis_1 = __importDefault(require("ioredis"));
// Rate limiting store using Redis
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
/**
 * Authentication middleware for API key validation
 */
const authenticateApiKey = (options = {}) => {
    return async (req, res, next) => {
        try {
            // Extract API key and secret from headers
            const apiKey = req.headers['x-api-key'];
            const apiSecret = req.headers['x-api-secret'];
            // Check if API key and secret are provided
            if (!apiKey || !apiSecret) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'API key and secret are required',
                    code: 'MISSING_CREDENTIALS'
                });
            }
            // Find and validate API key
            const keyDoc = await ApiKey_1.ApiKey.findOne({
                apiKey,
                isActive: true
            }).exec();
            if (!keyDoc) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid API key',
                    code: 'INVALID_API_KEY'
                });
            }
            // Validate API secret
            if (!keyDoc.validateApiSecret(apiSecret)) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid API secret',
                    code: 'INVALID_API_SECRET'
                });
            }
            // Check if API key is expired
            if (keyDoc.isExpired()) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'API key has expired',
                    code: 'EXPIRED_API_KEY'
                });
            }
            // Check permissions if required
            if (options.requiredPermissions) {
                const hasPermission = options.requiredPermissions.some(permission => keyDoc.hasPermission(permission));
                if (!hasPermission) {
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: 'Insufficient permissions',
                        code: 'INSUFFICIENT_PERMISSIONS',
                        required: options.requiredPermissions
                    });
                }
            }
            // Rate limiting (skip if explicitly disabled)
            if (!options.skipRateLimit) {
                const rateLimitKey = `rate_limit:${apiKey}`;
                const currentRequests = await redis.get(rateLimitKey);
                if (currentRequests && parseInt(currentRequests) >= keyDoc.rateLimit.requests) {
                    return res.status(429).json({
                        error: 'Too Many Requests',
                        message: 'Rate limit exceeded',
                        code: 'RATE_LIMIT_EXCEEDED',
                        retryAfter: Math.ceil(keyDoc.rateLimit.windowMs / 1000)
                    });
                }
                // Increment rate limit counter
                if (currentRequests) {
                    await redis.incr(rateLimitKey);
                }
                else {
                    await redis.setex(rateLimitKey, Math.ceil(keyDoc.rateLimit.windowMs / 1000), '1');
                }
            }
            // Update last used timestamp
            keyDoc.lastUsed = new Date();
            await keyDoc.save();
            // Attach API key info to request
            req.apiKey = keyDoc;
            req.userId = keyDoc.userId;
            next();
        }
        catch (error) {
            console.error('Authentication error:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Authentication failed',
                code: 'AUTH_ERROR'
            });
        }
    };
};
exports.authenticateApiKey = authenticateApiKey;
/**
 * Permission-based middleware factory
 */
const requirePermission = (permission) => {
    return (0, exports.authenticateApiKey)({ requiredPermissions: [permission] });
};
exports.requirePermission = requirePermission;
/**
 * Multiple permissions middleware factory
 */
const requirePermissions = (permissions) => {
    return (0, exports.authenticateApiKey)({ requiredPermissions: permissions });
};
exports.requirePermissions = requirePermissions;
/**
 * Admin-only middleware
 */
const requireAdmin = () => {
    return (0, exports.authenticateApiKey)({ requiredPermissions: ['admin:all'] });
};
exports.requireAdmin = requireAdmin;
/**
 * Optional authentication middleware (for public endpoints with optional auth)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        const apiSecret = req.headers['x-api-secret'];
        if (apiKey && apiSecret) {
            const keyDoc = await ApiKey_1.ApiKey.findOne({
                apiKey,
                isActive: true
            }).exec();
            if (keyDoc && keyDoc.validateApiSecret(apiSecret) && !keyDoc.isExpired()) {
                req.apiKey = keyDoc;
                req.userId = keyDoc.userId;
                // Update last used
                keyDoc.lastUsed = new Date();
                await keyDoc.save();
            }
        }
        next();
    }
    catch (error) {
        // Continue without authentication on error
        next();
    }
};
exports.optionalAuth = optionalAuth;
