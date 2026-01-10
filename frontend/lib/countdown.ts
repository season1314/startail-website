"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function useManualCountdown() {
    const [seconds, setSeconds] = useState<number | null>(null);
    const [targetUrl, setTargetUrl] = useState<string>("");
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (seconds === null) return;

        if (seconds <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            router.push(targetUrl);
            return;
        }

        timerRef.current = setInterval(() => {
            setSeconds((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [seconds, targetUrl, router]);

    const startCountDown = (url: string, secs: number = 5) => {
        setTargetUrl(url);
        setSeconds(secs);
    };

    return { seconds, startCountDown };
}