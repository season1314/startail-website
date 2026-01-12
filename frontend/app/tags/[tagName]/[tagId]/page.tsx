import { notFound } from 'next/navigation';
import http from "@/server/methods/http";
import ArticlesList from "@/components/articleList";
import { getArticleList } from "@/server/controller/article";

export interface PageProps {
    params: Promise<{ tagId: string }>;
}

export default async function TagsPage({ params }: PageProps) {
    const { tagId } = await params;
    const articleList = await getArticleList(`articles/tag/${tagId}?page=1`);
    return ( <ArticlesList initialData={articleList} path={`articles/tag/${tagId}?page=`} tagId={tagId}/>);
}