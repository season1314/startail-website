"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePathname } from "next/navigation"
import { signUp, userData } from "@/server/controller/auth"
import Link from "next/link"
import { useEffect, useState } from "react";
import { valid } from "@/lib/validation";
import { LoaderCircle } from 'lucide-react';
import { errorLabelVariants } from "@/lib/style"
import { cn } from "@/lib/utils";

export default function Login() {
    const [error, setError] = useState({ email: "", password: "" })
    const [value, setValue] = useState({ email: "", password: "" })
    const [pending, setPending] = useState(false)


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value: inputValue } = e.target;
        setValue((prev) => ({ ...prev, [id]: inputValue, }));
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        const { id } = e.target;
        setError((prev) => ({ ...prev, [id]: "" }))
    }

    const handleLogin = async () => {
        setPending(true)
        const newErrors: typeof value = { email: "", password: "" };
        Object.entries(value).forEach(([key, val]) => {
            let error: string[]
            const fieldKey = key as keyof typeof value;
            if (fieldKey == "email") { error = valid(val).required().email().getErrors() }
            else { error = valid(val).required().length(6, 20).getErrors() }
            newErrors[fieldKey] = (error && error.length > 0) ? error[0] : "";
        });

        const isAllEmpty = Object.values(newErrors).every(val => val.trim() === "");
        if (!isAllEmpty) { setError(newErrors); setPending(false); return }

        const result = await signUp(value.email, value.password)
        if (result.code == 0) { console.log(result.data); return }
        if (result.code == 1 && result.data) { setPending(false), setError(result.data) }
        console.log(result)
        return
    }

    useEffect(() => {
        const fetchUser = async () => { const data = await userData();console.log(data)};
        fetchUser();
    }, [])


    return (
        <div className="rounded-[2px] border border-slate-200 bg-white p-6 w-[300px] mb-[10px]">
            <a className="ext-[10px] font-extrabold">Login to your account</a>
            <form>
                <div className="flex flex-col gap-1">
                    <div className="grid gap-2 mt-6">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            onChange={handleChange}
                            disabled={pending}
                            onFocus={handleFocus}
                        />
                        <div className={cn(errorLabelVariants)}>{error.email}</div>
                    </div>
                    <div className="grid gap-2 mt-3 ">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                        </div>
                        <Input id="password" type="password" required onChange={handleChange} disabled={pending} onFocus={handleFocus} />
                        <div className={cn(errorLabelVariants)}>{error.password}</div>
                    </div>
                </div>
            </form>
            <Button type="submit" className="w-full cursor-pointer  mt-6" onClick={handleLogin} disabled={pending}>
                {pending ? (<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />) : ('Login')}</Button>
            <div className="flex mt-6 justify-between items-center">
                <Button variant="link" className="ext-[10px] cursor-pointer"><Link href="/auth/register">Sign Up</Link></Button>
                <Button variant="link" className="ext-[10px] cursor-pointer">Forget Password?</Button>
            </div>
        </div>
    )
}
