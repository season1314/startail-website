"use client"
import * as React from "react"
import { Progress } from "@/app/components/ui/progress"
import { usePathname, useSearchParams } from "next/navigation"

export default function TopProgressBar() {
    const [progress, setProgress] = React.useState(0)
    const [isVisible, setIsVisible] = React.useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    React.useEffect(() => {
        setIsVisible(true)
        setProgress(2)

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 80) return prev + 0.5
                if (prev >= 50) return prev + 2
                return prev + 10
            })
        }, 200)

        const complete = () => {
            setProgress(100)
            setTimeout(() => {
                setIsVisible(false)
                setTimeout(() => setProgress(0), 400)
            }, 300)
        }

        complete()

        return () => {
            clearInterval(timer)
        }
    }, [pathname, searchParams])

    if (!isVisible) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999]">
            <Progress
                value={progress}
                className="h-[1px] w-full rounded-none bg-transparent"
            />
            <style jsx global>{`
        [data-radix-progress-indicator] {
          box-shadow: 0 0 10px 1px rgba(15, 23, 42, 0.3);
        }
      `}</style>
        </div>
    )
}