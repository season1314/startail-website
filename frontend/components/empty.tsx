import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { SquareDashedKanban } from 'lucide-react';
import { SearchX } from 'lucide-react';

interface EmptyOutlineProps {
    notice?: string | null;
    des?: string;
    icon?: string;
}

export function EmptyOutline({ notice = "No Record Found", des = "We couldn't find any items in database", icon = "SquareDashedKanban" }: EmptyOutlineProps) {
    return (
        <div className="rounded-[2px] border border-slate-200 bg-white px-6 py-0 w-[700] h-[calc(100vh-100px)] flex items-center justify-center">
            <Empty className="w-[100%]">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        {icon == "SquareDashedKanban" && <SquareDashedKanban />}
                        {icon == "SearchX" && <SearchX />}
                    </EmptyMedia>
                    <EmptyTitle>{notice}</EmptyTitle>
                    <EmptyDescription className="w-[100%]">
                        {des}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </div>
    )
}
