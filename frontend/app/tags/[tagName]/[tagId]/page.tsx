import { notFound } from 'next/navigation';
import http from "@/server/config/http";
import ArticlesList from "@/components/articleList";
import { getArticleList } from "@/server/article";

export interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function TagsPage({ params }: PageProps) {
    const { slug } = await params;
    try {
        const articleList = await getArticleList(`articles/tags/${slug}?page=1`);
        return (
            <ArticlesList
                initialData={articleList}
                path={`articles/tags/${slug}?page=`}
            />
        );
    } catch (error: any) {
        console.error(error);
        return notFound();
    }
}