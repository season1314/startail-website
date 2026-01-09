import { notFound } from 'next/navigation';
import http from "@/lib/http";
import ArticlesList from "@/components/articleList";
import type { PageProps } from "@/interface"

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;
    try {
        const articleList = await http.get<any>(`articles/category/${slug}?page=1`);
        return (
            <ArticlesList
                initialData={articleList}
                path={`articles/category/${slug}?page=`}
            />
        );
    } catch (error: any) {
        console.error(error);
        return notFound();
    }
}