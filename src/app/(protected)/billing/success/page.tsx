"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { combinedSlug } from "@/lib/utils";

const Page = () => {
    const router = useRouter();
    const redirected = useRef(false);
    const [timedOut, setTimedOut] = useState(false);

    // 1) Get current user
    const me = useQuery(api.user.getCurrentUser);

    // 2) Get entitlement status once we have me.id
    const entitled = useQuery(
        api.subscription.hasEntitlement,
        me?._id ? { userId: me._id } : "skip" as any
    ) as boolean | undefined;

    // 3) Redirection logic
    useEffect(() => {
        if (redirected.current) return;

        // Still loading user
        if (me === undefined) return;

        // Not signed in
        if (me === null) {
            redirected.current = true;
            router.replace("/auth/sign-in");
            return;
        }

        // Still loading entitlement
        if (entitled === undefined) return;

        // Entitled -> Move to dashboard
        if (entitled) {
            redirected.current = true;
            // Redirect to the sluggy dashboard as done in root dashboard page
            router.replace(`/dashboard/${combinedSlug(me.name!)}`);
        }
    }, [me, entitled, router]);

    // 4) 45s fallback to billing if still not entitled
    useEffect(() => {
        if (redirected.current) return;
        if (!me || entitled === true) return;

        const t = setTimeout(() => {
            if (redirected.current) return;
            setTimedOut(true);
            redirected.current = true;
            if (me && me.name) {
                router.replace(`/billing/${combinedSlug(me.name)}`);
            }
        }, 45_000);

        return () => clearTimeout(t);
    }, [me, entitled, router]);

    // 5) UI
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="mx-auto max-w-md p-8 text-center">
                <div className="mb-3">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent align-[-2px]" />
                </div>
                <div className="mb-1 text-lg font-medium">Finalizing your subscription...</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
                    {me === undefined
                        ? "Checking your account..."
                        : entitled === undefined
                            ? "Confirming your entitlement..."
                            : timedOut
                                ? "Taking longer than expected - redirecting to billing."
                                : "This should only take a few seconds."}
                </div>
            </div>
        </div>
    );
};

export default Page;
