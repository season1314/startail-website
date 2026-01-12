"use server";
import http from "@/server/methods/http"
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