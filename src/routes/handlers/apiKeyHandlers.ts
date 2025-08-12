import { Request, Response } from 'express';
import { ApiKey, IApiKey } from '../../models/ApiKey';
import { requireAdmin, requirePermission } from '../../middleware/auth';

/**
 * Create a new API key
 * POST /api/keys
 */
export const createApiKey = async (req: Request, res: Response) => {
  try {
    const { name, userId, permissions, rateLimit, expiresAt } = req.body;

    // Validate required fields
    if (!name || !userId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name and userId are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate permissions
    const validPermissions = [
      'wallet:create', 'wallet:read', 'wallet:update', 'wallet:delete',
      'address:create', 'address:read', 'address:update', 'address:delete',
      'transaction:read', 'transaction:create', 'transaction:update',
      'token:read', 'admin:all'
    ];

    if (permissions && !permissions.every((p: string) => validPermissions.includes(p))) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid permissions provided',
        code: 'INVALID_PERMISSIONS'
      });
    }

    // Create new API key
    const apiKey = new ApiKey({
      name,
      userId,
      permissions: permissions || ['token:read'], // Default to read-only
      rateLimit: rateLimit || { requests: 1000, windowMs: 900000 }, // 1000 requests per 15 minutes
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await apiKey.save();

    // Return the API key and secret (only shown once)
    res.status(201).json({
      message: 'API key created successfully',
      data: {
        id: apiKey._id,
        name: apiKey.name,
        apiKey: apiKey.apiKey,
        apiSecret: apiKey.apiSecret, // Only shown on creation
        userId: apiKey.userId,
        permissions: apiKey.permissions,
        rateLimit: apiKey.rateLimit,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt
      },
      warning: 'Store the API secret securely. It will not be shown again.'
    });

  } catch (error) {
    console.error('Error creating API key:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'API key with this name already exists',
        code: 'DUPLICATE_API_KEY'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create API key',
      code: 'CREATE_ERROR'
    });
  }
};

/**
 * List all API keys for a user
 * GET /api/keys
 */
export const listApiKeys = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const requestingUserId = req.userId;

    // Users can only see their own API keys, admins can see all
    const query: any = {};
    if (userId && req.apiKey?.hasPermission('admin:all')) {
      query.userId = userId;
    } else {
      query.userId = requestingUserId;
    }

    const apiKeys = await ApiKey.find(query)
      .select('-apiSecret') // Don't return secrets
      .sort({ createdAt: -1 })
      .exec();

    res.json({
      message: 'API keys retrieved successfully',
      data: apiKeys,
      count: apiKeys.length
    });

  } catch (error) {
    console.error('Error listing API keys:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve API keys',
      code: 'LIST_ERROR'
    });
  }
};

/**
 * Get API key details
 * GET /api/keys/:id
 */
export const getApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.userId;

    const apiKey = await ApiKey.findById(id).exec();

    if (!apiKey) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API key not found',
        code: 'API_KEY_NOT_FOUND'
      });
    }

    // Check if user has access to this API key
    if (apiKey.userId !== requestingUserId && !req.apiKey?.hasPermission('admin:all')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this API key',
        code: 'ACCESS_DENIED'
      });
    }

    // Don't return the secret
    const { apiSecret, ...apiKeyData } = apiKey.toObject();

    res.json({
      message: 'API key retrieved successfully',
      data: apiKeyData
    });

  } catch (error) {
    console.error('Error getting API key:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve API key',
      code: 'GET_ERROR'
    });
  }
};

/**
 * Update API key
 * PUT /api/keys/:id
 */
export const updateApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, permissions, rateLimit, isActive, expiresAt } = req.body;
    const requestingUserId = req.userId;

    const apiKey = await ApiKey.findById(id).exec();

    if (!apiKey) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API key not found',
        code: 'API_KEY_NOT_FOUND'
      });
    }

    // Check if user has access to this API key
    if (apiKey.userId !== requestingUserId && !req.apiKey?.hasPermission('admin:all')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this API key',
        code: 'ACCESS_DENIED'
      });
    }

    // Update fields
    if (name !== undefined) apiKey.name = name;
    if (permissions !== undefined) apiKey.permissions = permissions;
    if (rateLimit !== undefined) apiKey.rateLimit = rateLimit;
    if (isActive !== undefined) apiKey.isActive = isActive;
    if (expiresAt !== undefined) apiKey.expiresAt = expiresAt ? new Date(expiresAt) : undefined;

    await apiKey.save();

    // Don't return the secret
    const { apiSecret, ...apiKeyData } = apiKey.toObject();

    res.json({
      message: 'API key updated successfully',
      data: apiKeyData
    });

  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update API key',
      code: 'UPDATE_ERROR'
    });
  }
};

/**
 * Delete API key
 * DELETE /api/keys/:id
 */
export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.userId;

    const apiKey = await ApiKey.findById(id).exec();

    if (!apiKey) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API key not found',
        code: 'API_KEY_NOT_FOUND'
      });
    }

    // Check if user has access to this API key
    if (apiKey.userId !== requestingUserId && !req.apiKey?.hasPermission('admin:all')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this API key',
        code: 'ACCESS_DENIED'
      });
    }

    await ApiKey.findByIdAndDelete(id).exec();

    res.json({
      message: 'API key deleted successfully',
      data: { id }
    });

  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete API key',
      code: 'DELETE_ERROR'
    });
  }
};

/**
 * Regenerate API secret
 * POST /api/keys/:id/regenerate-secret
 */
export const regenerateApiSecret = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.userId;

    const apiKey = await ApiKey.findById(id).exec();

    if (!apiKey) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API key not found',
        code: 'API_KEY_NOT_FOUND'
      });
    }

    // Check if user has access to this API key
    if (apiKey.userId !== requestingUserId && !req.apiKey?.hasPermission('admin:all')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this API key',
        code: 'ACCESS_DENIED'
      });
    }

    // Generate new secret
    apiKey.apiSecret = apiKey.generateApiSecret();
    await apiKey.save();

    res.json({
      message: 'API secret regenerated successfully',
      data: {
        id: apiKey._id,
        apiSecret: apiKey.apiSecret
      },
      warning: 'Store the new API secret securely. The old secret is no longer valid.'
    });

  } catch (error) {
    console.error('Error regenerating API secret:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to regenerate API secret',
      code: 'REGENERATE_ERROR'
    });
  }
};
