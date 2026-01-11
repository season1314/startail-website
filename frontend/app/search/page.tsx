"use client";
import { notFound } from 'next/navigation';
import http from "@/server/config/http";
import ArticlesList from "@/components/articleList";
import { getArticleList } from "@/server/article";

export interface PageProps {
    params: Promise<{ tagId: string }>;
}

export default async function SearchPage({ params }: PageProps) {
    const { tagId } = await params;
}