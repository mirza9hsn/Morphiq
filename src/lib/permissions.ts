export const isPublicRoutes = [
    "api/auth(.*)",
    "/"
]

export const isProtectedRoutes = [
    "/dashboard(.*)"
]

export const isBypassRoutes = [
    "api/polar/webhook",
    "api/innjest(.*)",
    "api/auth(.*)",
    "/convex(.*)",
]