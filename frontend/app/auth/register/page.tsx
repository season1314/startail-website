"use client";
import SendMail from "@/app/components/sendMail"
import { useState, useEffect } from "react";
import { checkCache, createUser } from "@/server/controller/auth"
import { useSearchParams, useParams } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { LoaderCircle } from 'lucide-react';
import { sendRegisterEmail } from "@/server/controller/sendMail"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { valid } from "@/lib/validation";
import Link from "next/link"
import { Label } from "@/app/components/ui/label"
import { cn } from "@/lib/utils";
import { errorLabelVariants } from "@/lib/style"
import { useManualCountdown } from "@/lib/countdown";


export default function signUp() {
    const [child, setChild] = useState("");
    const [info, setInfo] = useState(false)
    const searchParams = useSearchParams()
    const urlKey = searchParams.get("key") || "";
    const urlCode = searchParams.get("code") || "";
    const [pending, setPending] = useState(false)
    const [error, setError] = useState({ nickname: "", password: "", confirmPwd: "" })
    const [value, setValue] = useState({ nickname: "", password: "", confirmPwd: "", })
    const { seconds, startCountDown } = useManualCountdown();
    const [messages, setMessages] = useState("")

    useEffect(() => {
        if (!urlKey || !urlCode) { setChild("showMail"); return }

        load()

        async function load() {
            const isExpired = await checkCache(urlCode, urlKey);
            if (!isExpired) { setChild("showExpired"); return }
            setChild("showReg")
        }
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value: inputValue } = e.target;
        setValue((prev) => ({ ...prev, [id]: inputValue, }));
    };


    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        const { id } = e.target;
        setError((prev) => ({ ...prev, [id]: "" }))
    }

    const submit = async () => {
        setPending(true)
        //Check params validation
        const newErrors: typeof value = { nickname: "", password: "", confirmPwd: "" };
        Object.entries(value).forEach(([key, val]) => {
            let error: string[]
            const fieldKey = key as keyof typeof value;
            if (fieldKey == "nickname") { error = valid(val).required().length(4, 20).getErrors() }
            else { error = valid(val).required().length(6, 20).getErrors() }
            newErrors[fieldKey] = (error && error.length > 0) ? error[0] : "";
        });
        const isAllEmpty = Object.values(newErrors).every(val => val.trim() === "");
        if (!isAllEmpty) { setError(newErrors); setPending(false); return }

        //Check password and confirm password
        if (value.confirmPwd !== value.password) { newErrors.confirmPwd = "Passwords do not match"; setError(newErrors); setPending(false); return }

        //submit to server
        const result = await createUser(value, urlCode)
        if (result.code == 0) { setChild("showSuccess"); startCountDown("/", 5); return }
        if (result.code == 1 && result.messages) { setPending(false); setMessages(result.messages); setInfo(true); return }
        if (result.code == 1 && result.data) { setPending(false), setError(result.data) }
        return
    }

    return (
        <div className="overflow-hidden w-[100%] mt-[100px]">
            {child == "showMail" && <SendMail title="Sign Up" introduction="Welcome to STRATAIL! Enter your email below to start your journey." sendKey="reg:" />}
            {child == "showReg" && <> <Card className="w-[460px] rounded-[2px] h-[600px]">
                <CardHeader>
                    <CardTitle>Complete Sign Up</CardTitle>
                    <CardDescription className="mt-3">
                        Please complete the final steps of your registration to activate your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                {!info ? (
                                    <>
                                        <Label htmlFor="nickname">Nickname</Label>
                                        <Input
                                            id="nickname"
                                            type="nickname"
                                            placeholder="Enter Your NickName"
                                            className="mt-2"
                                            value={value.nickname}
                                            disabled={pending}
                                            onChange={handleChange}
                                            onFocus={handleFocus}
                                            required
                                        />
                                        <div className={cn(errorLabelVariants)}>
                                            {error.nickname}
                                        </div>
                                        <Label htmlFor="nickname">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter Your Password"
                                            className="mt-1"
                                            value={value.password}
                                            disabled={pending}
                                            onChange={handleChange}
                                            onFocus={handleFocus}
                                            required
                                        />
                                        <div className={cn(errorLabelVariants)}>
                                            {error.password}
                                        </div>
                                        <Label htmlFor="confirmPwd">Confirm Password</Label>
                                        <Input
                                            id="confirmPwd"
                                            type="confirmPwd"
                                            placeholder="Re-Enter Your Password"
                                            className="mt-1"
                                            value={value.confirmPwd}
                                            disabled={pending}
                                            onChange={handleChange}
                                            onFocus={handleFocus}
                                            required
                                        />
                                        <div className={cn(errorLabelVariants)}>
                                            {error.confirmPwd}
                                        </div>
                                    </>) : (<><a>{messages}</a></>)}
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    {!info ? (
                        <>
                            <Button type="submit" className="w-full cursor-pointer" onClick={submit} disabled={pending}>
                                {pending ? (<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />) : ('Submit')}</Button>
                            <Button className="w-full cursor-pointer mt-[20px]" variant="outline" onClick={() => { setChild("showMail") }} disabled={pending}>Resend Email</Button>
                        </>) : (
                        <Button className="w-full cursor-pointer mt-[20px]" variant="outline" onClick={() => { setInfo(false) }} disabled={pending}>Back</Button>
                    )}
                    <Link href="/" className={cn("w-full cursor-pointer", pending && "pointer-events-none")}>
                        <Button className="w-full cursor-pointer" variant="outline" disabled={pending}>
                            Home
                        </Button>
                    </Link>
                </CardFooter>
            </Card></>}
            {child == "showExpired" && <>
                <a>The link has expired. Please resend the verification email</a>
                <div className="flex mt-6 flex-col">
                    <Button className="w-full cursor-pointer mt-[20px]" onClick={() => { setChild('showMail') }}>Back</Button>
                    <Link href="/" className="w-full cursor-pointer mt-[20px]">
                        <Button className="w-full cursor-pointer" variant="outline">
                            Home
                        </Button>
                    </Link>
                </div>
            </>}
            {child == "showSuccess" && <>
                <a>Sign up successful. Redirecting to home page in {seconds} seconds...</a>
                <div className="flex mt-6 flex-col">
                    <Link href="/" className="w-full cursor-pointer mt-[20px]">
                        <Button className="w-full cursor-pointer" variant="outline">
                            Home
                        </Button>
                    </Link>
                </div>
            </>}
        </div>
    )
}
