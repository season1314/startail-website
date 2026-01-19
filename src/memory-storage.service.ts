import { Injectable } from '@nestjs/common';

@Injectable()
export class MemoryStorageService {
    private store: Map<string, any> = new Map();

    set(key: string, value: any, ttl: number = 0) {
        this.store.set(key, value);
        if (ttl > 0) {
            setTimeout(() => {
                this.store.delete(key);
            }, ttl * 1000);
        }
    }

    get(key: string) {
        return this.store.get(key);
    }

    delete(key: string) {
        this.store.delete(key);
    }

    clear() {
        this.store.clear();
    }
}
