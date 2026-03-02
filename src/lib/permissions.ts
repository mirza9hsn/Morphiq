export const isPublicRoutes = [
    "/",
    "/auth(.*)",
    "/api/auth(.*)"
]

export const isProtectedRoutes = [
    "/dashboard(.*)",
    "/billing(.*)"
]

export const isBypassRoutes = [
    "/api/billing/webhook",
    "/api/inngest(.*)",
    "/convex(.*)",
]
