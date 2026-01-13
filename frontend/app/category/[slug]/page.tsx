import { notFound } from 'next/navigation';
import http from "@/server/methods/http";
import ArticlesList from "@/app/components/articleList";
import { getArticleList } from "@/server/controller/article";
import { EmptyOutline } from "@/app/components/empty"

export interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;
    try {
        const articleList = await getArticleList(`articles/category/${slug}?page=1`);

        if (articleList && articleList.length > 0) {
            return (<ArticlesList initialData={articleList} path={`articles/category/${slug}?page=`} />);
        }
        return (<EmptyOutline />);
    } catch (error: any) {
        console.error(error);
        return notFound();
    }
}