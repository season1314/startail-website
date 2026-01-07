"use client";
import { ArticleItem } from "@/interface"
import { Badge } from "@/components/ui/badge"
import { ListChevronsUpDown, ListChevronsDownUp, Download } from 'lucide-react';
import { useState } from 'react';


export default function Articles({ article }: { article: ArticleItem }) {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="py-6 border-b border-slate-200">
            <h3 className="text-lg font-bold">{article.title}</h3>
            {isExpanded ? (<div className="mt-2 text-sm text-slate-500">
                <img
                    src={article.cover}
                    alt="cover"
                    className="w-full h-auto object-contain"
                />
                <div className="w-[100%] h-auto mt-4 leading-relaxed">
                    {article.summary}
                </div>
                <div>
                    {article.files.length > 0 && (
                        <div className="w-[100%] rounded-sm bg-slate-200 mt-4 p-4">
                            {article.files.map((item) => {
                                return (<div className="mt-1" key={item.des}>
                                    <a className="text-xs font-semibold text-slate-700 uppercase tracking-tight">{item.des} : </a>
                                    <a
                                        href={item.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] text-slate-500 truncate transition-colors hover:text-blue-600 hover:underline underline-offset-4"
                                    >
                                        {item.path}
                                    </a>
                                </div>)
                            })}
                        </div>
                    )}
                </div>
            </div>) : (<div className="mt-2 text-sm text-slate-500 flex">
                <div className="w-[200px] h-[100px] bg-no-repeat bg-cover bg-center rounded-[2px] border border-slate-100" style={{ backgroundImage: `url(${article.cover})` }} />
                <div className="w-[600px] pl-[10px] h-[100px] overflow-hidden">
                    <p className="line-clamp-4 leading-[25px]">
                        {article.summary}
                    </p>
                </div>
            </div>)}
            <div className="mt-2">
                {article.tags.map((tag) => {
                    return (
                        <Badge className="h-5 rounded-full px-1.5 font-mono tabular-nums mr-3 mt-3" key={tag.id}>
                            {tag.name}
                        </Badge>
                    )
                })}
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase pt-4 flex justify-between items-center">
                <a>Created By {article.createdInfo.name} {article.createdAt}</a>
                {isExpanded ? (<ListChevronsDownUp className="h-4 w-4 text-slate-500" onClick={() => setIsExpanded(!isExpanded)} />) : (<ListChevronsUpDown className="h-4 w-4 text-slate-500" onClick={() => setIsExpanded(!isExpanded)} />)}
            </div>
        </div>
    )
}