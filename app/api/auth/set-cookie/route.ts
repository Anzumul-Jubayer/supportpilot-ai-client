import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

  // Set cookie server-side so it's guaranteed to be present
  // on the very next request (the redirect to /dashboard)
  response.cookies.set("token", token, {
    httpOnly: false, // needs to be readable by proxy
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });

  return response;
}
