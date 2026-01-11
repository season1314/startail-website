"use server";
import { setCache, getCache, deleteCache } from "@/server/config/cache"
import type { RegistrationRecord } from "@/server/interface/cacheInterface"
import { decodeData } from "@/server/config/crypto"
import http from "@/server/config/http"
import { verify, hash } from "@/server/config/hash"
import { valid } from "@/lib/validation";

export interface UserProps {
    password: string
    confirmPwd: string
    nickname: string
}

export async function checkCache(code: string, key: string) {
    const email = await decodeData(code)
    const cacheData: RegistrationRecord | undefined = await getCache('reg:' + email)
    if (!cacheData) return false
    if (cacheData.hash != key) return false
    return await verify(cacheData.email, cacheData.hash)
}

export async function createUser(user: UserProps, urlCode: string) {
    const email = await decodeData(urlCode)
    try {
        if (!email) return { code: 1, messages: "Invalid registration data provided." }
        const userData = user
        let newErrors: typeof user = { nickname: "", password: "", confirmPwd: "", };
        if (!userData.nickname || userData.nickname.length > 20 || userData.nickname.length < 4) {
            newErrors.nickname = "Nickname is required , must last than 20 and more than 4 characters"
        }
        if (!userData.password || userData.password.length > 20 || userData.password.length < 6) {
            newErrors.nickname = "Password is required , must last than 20 and more than 6 characters"
        }
        if (userData.password !== userData.confirmPwd) {
            newErrors["confirmPwd"] = "Passwords do not match";
        }

        const isAllEmpty = Object.values(newErrors).every(val => val.trim() === "");
        if (!isAllEmpty) { return { code: 1, data: newErrors } }
        userData.password = await hash(userData.password)
        const result = await http.post<any>('user', { nickname: userData.nickname, password: userData.password, email })
        if (result.code == 0) {
            await deleteCache('ref:' + email)
            return { code: 0, messages: 'Sign up successful!' }
        } else { return result }
    } catch (error) {
        return { code: 1, messages: error }
    }
}