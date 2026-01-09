"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function Login() {

    const pathname = usePathname();

    const hideHeaderRoutes = ["/auth/register", "/signup"];
    if (hideHeaderRoutes.includes(pathname)) {
        return null;
    }
    return (
        <div className="w-[300px] relative pt-[10px] ml-[10px]">
            <div className="fixed top-[74px] rounded-[2px] border border-slate-200 bg-white p-6 w-[300px]">
                <a className="ext-[10px] font-extrabold">Login to your account</a>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2 mt-6">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input id="password" type="password" required />
                        </div>
                    </div>
                </form>
                <Button type="submit" className="w-full mt-6 cursor-pointer">
                    Login
                </Button>
                <div className="flex mt-6 justify-between items-center">
                    <Button variant="link" className="ext-[10px] cursor-pointer"><Link href="/auth/register">Sign Up</Link></Button>
                    <Button variant="link" className="ext-[10px] cursor-pointer">Forget Password?</Button>
                </div>
            </div>
        </div>
    )
}
