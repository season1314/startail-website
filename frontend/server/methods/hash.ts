"use server";
import bcrypt from 'bcryptjs';

/**
 * Hash content using bcrypt
 * @param content text
 * @returns The hashed text
 */
export async function hash(content: string): Promise<string> {
    const salt = await bcrypt.genSalt(10); // 10 is the recommended cost factor
    return bcrypt.hash(content, salt);
}

/**
 * Compare a plain content with a hashed one
 * @param content Plain text from user input
 * @param HashContent The hash stored in cache/redis/db
 */
export async function verify(content: string, HashContent: string): Promise<boolean> {
    return bcrypt.compare(content, HashContent);
}