"use server";
import { setCache, getCache, clearCache } from "@/server/config/cache"
import type { RegistrationRecord } from "@/server/interface/cacheInterface"
import { decodeData } from "@/server/config/crypto"
import http from "@/lib/http"
import { verify } from "@/server/config/hash"

export async function checkCache(code: string, key: string) {
    const email = await decodeData(code)
    const cacheData: RegistrationRecord | undefined = await getCache('reg:' + email)
    if (!cacheData) return false
    return await verify(cacheData.email, cacheData.hash)
}