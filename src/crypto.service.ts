import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
    private readonly algorithm = 'aes-256-cbc';
    private readonly key: Buffer;

    constructor(private readonly configService: ConfigService) {
        const keyHex = this.configService.get<string>('CRYPTO_KEY');
        if (!keyHex) throw new Error('CRYPTO_KEY must be set');
        this.key = Buffer.from(keyHex, 'hex');
    }

    encrypt(text: string): string {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }

    decrypt(payload: string): string {
        const [ivHex, encrypted] = payload.split(':');
        const decipher = createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(ivHex, 'hex'),
        );
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
