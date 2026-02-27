"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSubscriptionPlan } from "@/hooks/use-billings";

interface SubscribeButtonProps {
    className?: string;
    children?: React.ReactNode;
}

export const SubscribeButton = ({ className, children }: SubscribeButtonProps) => {
    const { onSubscribe, activePlanId } = useSubscriptionPlan();

    return (
        <Button
            type="button"
            onClick={() => onSubscribe('standard')}
            disabled={activePlanId !== null}
            className={cn(
                'backdrop-blur-xl bg-white/[0.08] border border-white/[0.12]',
                'saturate-150 rounded-full shadow-xl cursor-pointer',
                'hover:bg-white/[0.12] hover:border-white/[0.16] hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300',
                'active:bg-white/[0.06] active:scale-[0.95]',
                'focus:outline-none focus:ring-2 focus:ring-white/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'text-white font-medium text-sm px-6 py-3',
                className
            )}
        >
            {activePlanId === 'standard' ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                </>
            ) : (
                children || 'Subscribe'
            )}
        </Button>
    );
};
