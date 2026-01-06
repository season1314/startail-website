"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from 'clsx'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"


interface MenuItem {
  key: string;
  value: string;
  path: string
}

interface HeaderProps {
  menu: MenuItem[];
}

export default function Header({ menu }: HeaderProps) {

  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-[10%]">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            STARTAIL
          </Link>
          <nav className="hidden md:flex gap-4 text-sm font-medium ml-4">
            <Link href="/" className={
              clsx('text-sm font-medium transition-colors', pathname == "/" ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-primary')
            }>
              Home
            </Link>
            {menu.map((item) => (<Link key={item.key} href={`/${item.path}`} className={
              clsx('text-sm font-medium transition-colors', pathname == `/${item.path}` ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-primary'
              )}>
              {item.value}
            </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Input placeholder="keywords..." className="w-80" ></Input>
          <Button variant="default" className="cursor-pointer h-8">
          <Search className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </header >
  )
}