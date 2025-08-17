import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // The authentication logic is now handled in the admin layout component
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
