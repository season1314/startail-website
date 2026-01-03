import { Injectable } from '@nestjs/common';

@Injectable()
export class MemoryStorageService {
    private store: Map<string, any> = new Map();

    async set(key: string, value: any, ttl: number = 0): Promise<void> {
        this.store.set(key, value);

        if (ttl > 0) {
            setTimeout(() => {
                this.store.delete(key);
            }, ttl * 1000);
        }
    }

    async get(key: string): Promise<any> {
        return this.store.get(key);
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    async clear(): Promise<void> {
        this.store.clear();
    }
}
