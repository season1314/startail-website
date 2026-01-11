"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from 'clsx'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"


interface MenuItem {
  key: string;
  value: string;
  path: string
}

interface HeaderProps {
  menu: MenuItem[];
}

export default function Header({ menu }: HeaderProps) {

  let tagName = null

  const pathname = usePathname();

  const hideHeaderRoutes = ["/auth/register", "/signup"];

  const isTagsPage = pathname?.startsWith('/tags');

  if (isTagsPage) {
    const segment = pathname.split('/').filter(Boolean)[1]
    tagName = segment ? decodeURIComponent(segment) : null
  }

  const activeStyle = "text-primary border-b-2 border-primary pointer-events-none cursor-default";
  const inactiveStyle = "text-muted-foreground border-transparent hover:text-primary cursor-pointer";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95">
      <div className="flex h-16 items-center justify-between pl-[10%] pr-[10%] w-full">
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
            {tagName && (<Link href="#" className={clsx('text-sm font-medium transition-colors', activeStyle)}>{tagName}</Link>)}
          </nav>
        </div>
        {!hideHeaderRoutes.includes(pathname) && (<div className="flex items-center justify-end w-[340px]">
          <InputGroup>
            <InputGroupInput placeholder="Keywords to search..." className="w-full"/>
            <InputGroupAddon align="inline-end">
              <InputGroupButton variant="outline"  className="transition-colors hover:bg-slate-900 hover:text-white cursor-pointer" >Search</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>)}
      </div>
    </header>
  )
}