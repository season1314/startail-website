"use server";
import { setCache, getCache, deleteCache } from "@/server/methods/cache"
import type { RegistrationRecord } from "@/server/interface/cacheInterface"
import { decodeData } from "@/server/methods/crypto"
import http from "@/server/methods/http"
import { verify, hash } from "@/server/methods/hash"
import { setSession, getSession } from "@/server/methods/session"
import { cookies } from "next/headers";

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

export async function signUp(email: string, password: string) {
    try {
        let newErrors = { email: "", password: "" }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) { newErrors.email = "Please enter a valid email address." }
        if (!password || password.length > 20 || password.length < 6) { newErrors.email = "Please enter a valid password." }
        const isAllEmpty = Object.values(newErrors).every(val => val.trim() === "");
        if (!isAllEmpty) { return { code: 1, data: newErrors } }

        const user = await http.get<any>('user/password/' + email)
        if (!user.data) {
            newErrors.email = "This email address is not signed up yet"
            return { code: 1, data: newErrors }
        }


        if (user.data.status != "available") {
            newErrors.email = "This account has been suspended"
            return { code: 1, data: newErrors }
        }

        let cachedData = await getCache<number>('login:' + email) || 10;

        if (cachedData <= 0) {
            newErrors.password = "Too many login attempts. Please try late."
            return { code: 1, data: newErrors }
        }

        const verifyResult = await verify(password, user.data.password)
        if (!verifyResult) {
            newErrors.password = `Incorrect password ${cachedData - 1} attempt remaining.`
            await setCache('login:' + email, cachedData - 1)
            return { code: 1, data: newErrors }
        }


        user.data = (({ password, status, ...rest }) => rest)(user.data);
        const sessionId = await setSession(user.data)
        const cookieStore = await cookies();
        (await cookies()).set("session-id", sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        });
        return { code: 0, data: user.data }

    } catch (error) {
        return { code: 1, messages: error }
    }
}

export async function userData() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session-id");
    if (!sessionCookie || !sessionCookie.value) return null;
    console.log(sessionCookie)
    const result = await getSession(sessionCookie.value)
    if (!result) return null
    return result
}