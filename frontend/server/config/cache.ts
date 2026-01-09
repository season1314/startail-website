"use server";
import { LRUCache } from 'lru-cache';

type CacheValue = any;
const globalForCache = global as unknown as { serverCache: LRUCache<string, CacheValue> };

const options = {
    max: 2000,
    ttl: 0,
};

const serverCache = globalForCache.serverCache || new LRUCache(options);
if (process.env.NODE_ENV !== 'production') globalForCache.serverCache = serverCache;


export async function setCache<T>(key: string, value: T, ttl?: number): Promise<void> {
    serverCache.set(key, value, { ttl });
}

export async function getCache<T>(key: string): Promise<T | undefined> {
    return serverCache.get(key) as T;
}

export async function hasCache(key: string): Promise<boolean> {
    return serverCache.has(key);
}

export async function deleteCache(key: string): Promise<void> {
    serverCache.delete(key);
}

export async function clearCache(): Promise<void> {
    serverCache.clear();
}