import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "Missing or invalid URL parameter" }, { status: 400 });
        }

        const response = await fetch(url);
        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch image: ${response.statusText}` }, { status: response.status });
        }

        const contentType = response.headers.get("content-type");
        if (!contentType?.startsWith("image/")) {
            return NextResponse.json({ error: "URL does not point to an image" }, { status: 400 });
        }

        const blob = await response.blob();

        return new NextResponse(blob, {
            headers: {
                "Content-Type": contentType,
            },
        });
    } catch (error) {
        console.error("Image proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
