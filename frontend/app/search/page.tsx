import { notFound } from 'next/navigation';
import http from "@/server/methods/http";
import ArticlesList from "@/app/components/articleList";
import { getArticleList } from "@/server/controller/article";
import { EmptyOutline } from "@/app/components/empty"

export interface PageProps {
    searchParams: Promise<{ keyword: string, category: string, type: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const { keyword, category, type } = params
    try {
        const articleList = await getArticleList(`search/articles?keyword=${keyword}&category=${category}&page=1`);
        const path = `search/articles?keyword=${keyword}&category=${category}&page=`
        if (articleList && articleList.length > 0) {
            return (
                <ArticlesList
                    key={path}
                    initialData={articleList}
                    path={path}
                />
            );
        }

        return (<EmptyOutline notice="No Match Result" des={`We couldn't find any items matching "${keyword}" ${category ? 'in this category' : ''}.`} />)
    } catch (error: any) {
        console.error(error);
        return notFound();
    }
}