
import Image from "next/image";
import http from "@/lib/http"
import Articles from "@/components/article"
import { ArticleItem } from "@/interface"
import ArticlesList from "@/components/articleList";
import Header from "@/components/header";


export default async function Home() {
  const articleList = await http.get<any>('articles?page=1');
  return (
    <ArticlesList initialData={articleList} path="articles?page="/>
  );
}
