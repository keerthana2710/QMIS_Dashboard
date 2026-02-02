import { NextResponse } from "next/server";

export function middleware(req) {
  const origin = req.headers.get("origin");

  const allowedOrigins = [
    "http://localhost:3000",
    "https://qmis-dashboard.vercel.app",
  ];

  const res = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }

  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: res.headers,
    });
  }

  return res;
}

export const config = {
  matcher: "/api/:path*",
};
