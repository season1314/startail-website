
import Image from "next/image";
import http from "@/server/config/http"
import Articles from "@/components/article"
import ArticlesList from "@/components/articleList";
import Header from "@/components/header";
import { getArticleList } from "@/server/article";


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
  return (
    <ArticlesList initialData={articleList} path="articles?page=" />
  );
}
