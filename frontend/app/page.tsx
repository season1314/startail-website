
import Image from "next/image";
import http from "@/server/methods/http"
import Articles from "@/app/components/article"
import ArticlesList from "@/app/components/articleList";
import Header from "@/app/components/header";
import { getArticleList } from "@/server/controller/article";
import { EmptyOutline } from "@/app/components/empty"


export interface ArticleProps {
  title: string
  id: string
  cover: string
  tags: any[]
  createdAt: string
  createdInfo: { name: string, email: string }
  summary: string,
  files: { des: string, path: string }[]
}


export default async function Home() {
  const articleList = await getArticleList('articles?page=1');
  if (articleList && articleList.length > 0) {
    return (<ArticlesList initialData={articleList} path="articles?page=" />);
  }
  return (<EmptyOutline />);
}
