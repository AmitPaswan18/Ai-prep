import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
        if (times > 3) {
            console.warn('Redis connection failed after 3 retries.');
            return null;
        }
        return Math.min(times * 200, 1000);
    }
});

redis.on('error', (err) => {
    console.error('Redis Error:', err);
});

export const cacheData = async (key: string, data: any, ttlSeconds: number = 3600) => {
    try {
        await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (err) {
        console.error('Redis Cache Set Error:', err);
    }
};

export const getCachedData = async <T>(key: string): Promise<T | null> => {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Redis Cache Get Error:', err);
        return null;
    }
};
