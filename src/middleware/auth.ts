import { Request, Response, NextFunction } from 'express';
import { ApiKey, IApiKey } from '../models/ApiKey';
import Redis from 'ioredis';

// Extend Express Request interface to include API key info
declare global {
  namespace Express {
    interface Request {
      apiKey?: IApiKey;
      userId?: string;
    }
  }
}

// Rate limiting store using Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export interface AuthOptions {
  requiredPermissions?: string[];
  skipRateLimit?: boolean;
}

/**
 * Authentication middleware for API key validation
 */
export const authenticateApiKey = (options: AuthOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract API key and secret from headers
      const apiKey = req.headers['x-api-key'] as string;
      const apiSecret = req.headers['x-api-secret'] as string;

      // Check if API key and secret are provided
      if (!apiKey || !apiSecret) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'API key and secret are required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      // Find and validate API key
      const keyDoc = await ApiKey.findOne({ 
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
        const hasPermission = options.requiredPermissions.some(permission => 
          keyDoc.hasPermission(permission)
        );
        
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
        } else {
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
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication failed',
        code: 'AUTH_ERROR'
      });
    }
  };
};

/**
 * Permission-based middleware factory
 */
export const requirePermission = (permission: string) => {
  return authenticateApiKey({ requiredPermissions: [permission] });
};

/**
 * Multiple permissions middleware factory
 */
export const requirePermissions = (permissions: string[]) => {
  return authenticateApiKey({ requiredPermissions: permissions });
};

/**
 * Admin-only middleware
 */
export const requireAdmin = () => {
  return authenticateApiKey({ requiredPermissions: ['admin:all'] });
};

/**
 * Optional authentication middleware (for public endpoints with optional auth)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const apiSecret = req.headers['x-api-secret'] as string;

    if (apiKey && apiSecret) {
      const keyDoc = await ApiKey.findOne({ 
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
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};
