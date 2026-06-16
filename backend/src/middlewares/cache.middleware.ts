import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import { AuthRequest } from './auth.middleware';

// TTL in seconds (default 5 minutes)
const cache = new NodeCache({ stdTTL: 300 });

export const cacheMiddleware = (duration?: number) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate a unique key for the request (include user and tenant if available)
        const userPart = req.user ? `_${req.user._id}` : '';
        const key = `__express__${req.originalUrl || req.url}${userPart}`;
        const cachedBody = cache.get(key);

        if (cachedBody) {
            return res.status(200).json(cachedBody);
        } else {
            const originalJson = res.json;
            res.json = (body) => {
                // Store in cache
                cache.set(key, body, duration || 300);
                return originalJson.call(res, body);
            };
            next();
        }
    };
};

export const clearCache = (keyPattern?: string) => {
    if (keyPattern) {
        const keys = cache.keys();
        const filteredKeys = keys.filter(key => key.includes(keyPattern));
        cache.del(filteredKeys);
    } else {
        cache.flushAll();
    }
};
