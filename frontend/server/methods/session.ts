import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";
import { setCache, getCache, deleteCache } from "@/server/methods/cache"

export async function setSession(userData: any) {
    const sessionId = uuid();
    const TTL_72H = 1000 * 60 * 60 * 72;
    await setCache(sessionId, userData, TTL_72H)
    return sessionId;
}

export async function getSession(sessionId: string) {
    return getCache(sessionId)
}

