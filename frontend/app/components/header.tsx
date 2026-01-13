"use client"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import clsx from 'clsx'
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/app/components/ui/input-group"
import { useEffect, useState } from "react"
import { activeStyle, inactiveStyle } from "@/lib/style"


interface MenuItem {
  key: string;
  value: string;
  path: string
}

export interface HeaderProps {
  menu: MenuItem[];
}

export default function Header({ menu }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname();
  const searchParams = useSearchParams()

  let tagName = null
  const hideHeaderRoutes = ["/auth/register", "/signup"];
  const isTagsPage = pathname?.startsWith('/tags');
  if (isTagsPage) {
    const segment = pathname.split('/').filter(Boolean)[1]
    tagName = segment ? decodeURIComponent(segment) : null
  }

  const [btnCss, setBtnCss] = useState("")
  const [keyword, setKeyword] = useState("")

  function handleSearchBtn(e: React.MouseEvent<HTMLButtonElement>) {
    if (e) e.preventDefault();
    if (pathname == '/search') {
      const type = searchParams.get('type') || "";
      const category = searchParams.get('category') || ""
      router.push(`/search?keyword=${keyword}&category=${category}&type=${type}`);
    } else {
      router.push(`/search?keyword=${keyword}`);
    }
  }

  useEffect(() => {
    if (pathname !== '/search') {
      setKeyword('')
    } else {
      const keyword = searchParams.get('keyword') || "";
      setKeyword(keyword)
    }
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95">
      <div className="flex h-16 items-center pl-[10%] pr-[10%] w-full">
        <div className="flex items-center gap-6  min-w-[700px]">
          <Link href="/" className="font-bold text-xl">
            STARTAIL
          </Link>
          <nav className="hidden md:flex gap-4 text-sm font-medium ml-4">
            <Link href="/" className={
              clsx('text-sm font-medium transition-colors', pathname == "/" ? activeStyle : inactiveStyle)
            }>
              Home
            </Link>
            {hideHeaderRoutes.includes(pathname) && (<Link href="/" className={
              clsx('text-sm font-medium transition-colors', pathname == "/auth/register" ? activeStyle : inactiveStyle)
            }>
              Sign Up
            </Link>
            )}
            {hideHeaderRoutes.includes(pathname) && (<Link href="/" className={
              clsx('text-sm font-medium transition-colors', pathname == "/signup" ? activeStyle : inactiveStyle)
            }>
              Reset Password
            </Link>
            )}
            {!hideHeaderRoutes.includes(pathname) && menu.map((item) => (<Link key={item.key} href={`/category/${item.path}`} className={
              clsx('text-sm font-medium transition-colors', pathname == `/category/${item.path}` ? activeStyle : inactiveStyle
              )}>
              {item.value}
            </Link>
            ))}
            {pathname == '/search' && (<Link href="#" className={clsx('text-sm font-medium transition-colors', activeStyle)}>Search</Link>)}
            {tagName && (<Link href="#" className={clsx('text-sm font-medium transition-colors', activeStyle)}>{tagName}</Link>)}
          </nav>
        </div>
        {!hideHeaderRoutes.includes(pathname) && (<div className="flex items-center w-[340px]">
          <InputGroup>
            <InputGroupInput placeholder="Keywords to search..." className="w-full" value={keyword}
              onFocus={() => setBtnCss('bg-slate-900 text-white')}
              onChange={(e) => setKeyword(e.target.value)}
              onBlur={(e) => { !e.target.value && setBtnCss('') }} />
            <InputGroupAddon align="inline-end">
              <InputGroupButton variant="outline" type="button" className={`cursor-pointer ${btnCss}`} onClick={handleSearchBtn}>Search</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>)}
      </div>
    </header>
  )
}