"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import type { HeaderProps } from "./header"
import { activeStyle, inactiveStyle } from "@/lib/style"
import clsx from 'clsx'
import { useEffect, useState } from "react"
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function SearchMenu({ menu }: HeaderProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter()
    const [keyword, setKeyword] = useState("");
    const [type, setType] = useState("")
    const [category, setCategory] = useState("")

    function handleLink(e: React.MouseEvent<HTMLAnchorElement>, params: string) {
        if (e) e.preventDefault();
        const url = `/search?keyword=${keyword}` + params
        router.push(url);
    }

    useEffect(() => {

        setKeyword(searchParams.get('keyword') || "");
        setType(searchParams.get('type') || "")
        setCategory(searchParams.get('category') || "")
    }, [searchParams])

    if (pathname != "/search") {
        return null;
    }

    return (
        <div className="rounded-[2px] border border-slate-200 bg-white p-6 w-[300px] mb-[10px]">
            <a className="ext-[10px] font-extrabold">Select search condition</a>
            <div className="flex flex-col mt-[20px]">
                <Link href="#" className={clsx('text-sm font-medium transition-colors mb-[15px]', (!type && !category) ? activeStyle : inactiveStyle)} onClick={(e) => handleLink(e, "")}>All Category</Link>
                {/* <Link href="#" className={clsx('text-sm font-medium transition-colors mb-[15px]', (type && type == "tags") ? activeStyle : inactiveStyle)} onClick={(e) => handleLink(e, "&type=tags")}>Tags</Link> */}
                {menu.map((item) => (<Link key={item.key} href="#" className={clsx('text-sm font-medium transition-colors mb-[15px]', (!type && category == item.key) ? activeStyle : inactiveStyle)} onClick={(e) => handleLink(e, "&category=" + item.key)}>
                    {item.value}
                </Link>))}
            </div>
        </div>
    )
}
