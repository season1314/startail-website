"use client"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { usePathname } from "next/navigation"
import Login from "@/app/components/login"
import Link from "next/link"
import SearchMenu from "@/app/components/searchMenu"
import type { HeaderProps } from "./header"


export default function Sidebar({ menu }: HeaderProps) {
    const pathname = usePathname();
    const hideHeaderRoutes = ["/auth/register", "/signup"];
    if (hideHeaderRoutes.includes(pathname)) {
        return null;
    }
    return (
        <div className="w-[300px] relative pt-[10px] ml-[10px]">
            <div className="fixed top-[74px]">
                <SearchMenu menu={menu} />
                <Login />
            </div>
        </div>
    )
}