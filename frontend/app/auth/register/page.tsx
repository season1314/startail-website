"use client";
import SendMail from "@/components/sendMail"
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { checkCache } from "@/server/register"
import { useSearchParams } from "next/navigation"


export default function signUp() {
    const [child, setChild] = useState("");
    const searchParams = useSearchParams()
    const urlKey = searchParams.get("key") || "";
    const urlCode = searchParams.get("code") || "";

    useEffect(() => {
        if (!urlKey || !urlCode) {
            setChild("showMail")
        } else {
            load()
        }
        async function load() {
            //check expired
            const res = await checkCache(urlCode, urlKey);
            setChild(res ? "showReg" : "showExpired")
        }
    }, []);

    return (
        <div className="overflow-hidden w-[100%] mt-[120px]">
            {child == "showMail" && <SendMail title="Sign Up" introduction="Welcome to STRATAIL! Enter your email below to start your journey." sendKey="reg:" />}
            {child == "showReg" && <>1111111111111</>}
            {child == "showExpired" && <>2222222222222222222</>}
        </div>
    )
}
