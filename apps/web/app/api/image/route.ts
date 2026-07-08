import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")

  if (!key) {
    return new NextResponse("File key is required", { status: 400 })
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
    const presignEndpoint = `${backendUrl}/media/presign?key=${encodeURIComponent(key)}`
    const cookieHeader = req.headers.get("cookie") || ""
    const response = await fetch(presignEndpoint, {
      method: "GET",
      headers: {
        "cookie": cookieHeader,
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch presigned URL for ${key}: ${response.statusText}`)
      return new NextResponse("Failed to fetch image", { status: response.status })
    }

    const data = await response.json()
    const url = data?.data?.url

    if (!url) {
      return new NextResponse("Image URL not found", { status: 404 })
    }
    return NextResponse.redirect(url, 302)
  } catch (error) {
    console.error(`Error proxying image ${key}:`, error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
