import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";
import { isBypassRoutes, isPublicRoutes, isProtectedRoutes } from "./lib/permissions";

const PublicMatcher = createRouteMatcher(isPublicRoutes);
const BypassMatcher = createRouteMatcher(isBypassRoutes);
const ProtectedMatcher = createRouteMatcher(isProtectedRoutes)

export default convexAuthNextjsMiddleware(
    async (request, { convexAuth }) => {
        const { pathname } = request.nextUrl;
        const isBypass = BypassMatcher(request);
        const authed = await convexAuth.isAuthenticated();
        const isPublic = PublicMatcher(request);
        const isProtected = ProtectedMatcher(request);

        console.log(`[Middleware] ${request.method} ${pathname}`, {
            isBypass,
            isPublic,
            isProtected,
            authed
        });

        if (isBypass) return
        if (isPublic && authed) {
            return nextjsMiddlewareRedirect(request, "/dashboard")
        }
        if (isProtected && !authed) {
            console.log(`[Middleware] Redirecting unauthenticated user from ${pathname} to /auth/sign-in`);
            return nextjsMiddlewareRedirect(request, "/auth/sign-in")
        }
    },
    // cookieConfig must be the 2nd argument here — NOT a return value from the
    // callback above. A bare `return` followed by `{ ... }` on the next line is
    // treated as `return undefined;` by JS (ASI), silently discarding the config.
    { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } } // 30 days
);

export const config = {
    // Runs on all routes except static assets
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};