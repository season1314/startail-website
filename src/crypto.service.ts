import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
    private readonly key: Buffer;
    private readonly alg = 'aes-256-cbc';

    constructor(private readonly config: ConfigService) {
        const keyHex = this.config.get<string>('CRYPTO_KEY');
        if (!keyHex) throw new Error('CRYPTO_KEY must be set');
        this.key = Buffer.from(keyHex, 'hex');
    }

    private toBase64Url(buf: Buffer): string {
        return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    private fromBase64Url(str: string): Buffer {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        return Buffer.from(str, 'base64');
    }

    encrypt(text: string): string {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.alg, this.key, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        return `${this.toBase64Url(iv)}:${this.toBase64Url(encrypted)}`;
    }

    decrypt(payload: string): any {
        try {
            const [ivB64, dataB64] = payload.split(':');
            const iv = this.fromBase64Url(ivB64);
            const encrypted = this.fromBase64Url(dataB64);
            const decipher = createDecipheriv(this.alg, this.key, iv);
            const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
            return decrypted.toString('utf8');
        } catch (error) {
            return false
        }
    }
}
