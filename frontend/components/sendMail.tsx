"use client";
import { Button } from "@/components/ui/button"
import { LoaderCircle } from 'lucide-react';
import { sendRegisterEmail } from "@/server/sendMail"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { valid } from "@/lib/validation";
import Link from "next/link"

export default function SendMail({ title, introduction, sendKey }: { title: string, introduction: string, sendKey: string }) {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("")
    const [pending, setPending] = useState(false)
    const [info, setInfo] = useState(false)
    const [label, setLabel] = useState("Your Email Address")

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setPending(true)
        const check = valid(email).required('Email is required').email().getErrors()
        if (check.length > 0) {
            setEmailError(check[0])
            setPending(false)
            return
        }
        const result = await sendRegisterEmail(email,sendKey)
        if (result.code == 0) {
            setInfo(true)
            setLabel(result.messages)
            const _email = result.email || ""
            setEmail(_email)
            setPending(false)
        } else {
            setInfo(true)
            setLabel(result.messages)
            const _email = result.email || ""
            setEmail(_email)
            setPending(false)
        }
        return
    };
    return (
        <Card className="w-[460px] rounded-[2px] h-[300px]">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="mt-3">
                    {introduction}
                </CardDescription>
            </CardHeader>
            <CardContent>

                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            {!info ? (
                                <>
                                    <Label htmlFor="email">{label}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        className="mt-2"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setEmailError('')}
                                        disabled={pending}
                                        required
                                    />
                                    <div className="text-[10px] text-destructive font-medium tracking-tight uppercase h-[8px] px-[5px]">
                                        {emailError}
                                    </div> </>) : (<><Label htmlFor="email">{label}</Label><a href={`mailto:${email}`} className="text-[14px] text-slate-500 truncate transition-colors hover:text-blue-600 hover:underline underline-offset-4 cursor-pointer">{email}</a></>)}
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                {!info ? (<Button type="submit" className="w-full cursor-pointer" onClick={handleSendEmail} disabled={pending}>
                    {pending ? (<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />) : ('Send Verification Email')}
                </Button>) : (<><Button className="w-full cursor-pointer" onClick={() => { setInfo(false); setLabel("Your Email Address") }}>Back</Button>
                    <Link href="/" className="w-full cursor-pointer">
                        <Button className="w-full cursor-pointer" variant="outline">
                            Home
                        </Button>
                    </Link>
                </>)}
            </CardFooter>
        </Card>
    )
}
