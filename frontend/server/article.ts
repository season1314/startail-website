"use server";
import { setCache, getCache, deleteCache } from "@/server/config/cache"
import type { RegistrationRecord } from "@/server/interface/cacheInterface"
import { decodeData } from "@/server/config/crypto"
import http from "@/server/config/http"
import { verify, hash } from "@/server/config/hash"
import { valid } from "@/lib/validation";
import { ArticleProps } from "@/server/interface/commonInterface"

export interface UserProps {
    password: string
    confirmPwd: string
    nickname: string
}


export async function getArticleList(url: string) {
    const res = (await http.get(url)) as { data: ArticleProps[] };
    return res.data
}