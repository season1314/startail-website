"use client";
import Image from "next/image";
import http from "@/server/config/http"
import Articles from "@/components/article"
import type { ArticleProps } from '@/app/page'
import { useState, useRef, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton"
import { getArticleList } from "@/server/article";

export default function ArticlesList({ initialData, path}: { initialData: ArticleProps[], path: string}) {
    const [articles, setArticles] = useState(initialData);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const bottomRef = useRef<HTMLDivElement>(null);

    const fetchMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const nextPage = page + 1;
            const res = await getArticleList(path + nextPage);
            if (res.length === 0) { setHasMore(false); } else {
                setArticles(prev => [...prev, ...res]);
                setPage(nextPage);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchMore()
                }
            },
            { threshold: 0.5 }
        );

        if (bottomRef.current) {
            observer.observe(bottomRef.current);
        }

        return () => observer.disconnect();
    }, [page, hasMore, loading]);


    return (
            <div className="rounded-[2px] border border-slate-200 bg-white px-6 py-0 w-[700]">
                {articles.map((item: ArticleProps) => {
                    return <Articles key={item.id} article={item} />
                })}
                {hasMore ? (<div className="flex items-center justify-center space-x-4 h-[320px]" ref={bottomRef}>
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>) : (<></>)}
            </div>
    );
}
