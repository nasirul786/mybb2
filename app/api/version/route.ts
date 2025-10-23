// app/api/version/route.ts
import { NextResponse } from "next/server"

// Ensure this route is never cached
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Server-side fetch has no CORS issues
    const res = await fetch("https://app.bots.business/version.json", {
      cache: "no-store", // Ensure we get the latest version
    })

    if (!res.ok) {
      return new NextResponse(res.statusText, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("API Error: Failed to fetch version:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}