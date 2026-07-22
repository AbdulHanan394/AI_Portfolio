// app/api/backend/[...path]/route.js

import { NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;
const BACKEND_API_KEY = process.env.BACKEND_API_KEY;

const BLOCKED_PREFIXES = ["admin", "auth"];

function buildTargetUrl(pathSegments = [], search) {
  const path = pathSegments.join("/");
  return `${BACKEND_BASE_URL}/api/v1/${path}${search}`;
}

async function forward(req, pathSegments = []) {
  if (!BACKEND_BASE_URL || !BACKEND_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Backend not configured. Set BACKEND_BASE_URL and BACKEND_API_KEY.",
      },
      { status: 500 }
    );
  }

  const first = pathSegments?.[0]?.toLowerCase();

  if (BLOCKED_PREFIXES.includes(first)) {
    return NextResponse.json(
      { error: "Not available through this proxy." },
      { status: 403 }
    );
  }

  const search = req.nextUrl.search;
  const targetUrl = buildTargetUrl(pathSegments, search);

  const init = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": BACKEND_API_KEY,
    },
    ...(req.method !== "GET" && req.method !== "HEAD"
      ? { body: await req.text() }
      : {}),
    cache: "no-store",
  };

  try {
    const res = await fetch(targetUrl, init);

    const text = await res.text();
    const contentType =
      res.headers.get("content-type") || "application/json";

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (err) {
    console.error("Backend proxy error:", err);

    return NextResponse.json(
      { error: "Failed to reach backend." },
      { status: 502 }
    );
  }
}


export async function GET(req, { params }) {
  const { path } = await params;
  return forward(req, path);
}


export async function POST(req, { params }) {
  const { path } = await params;
  return forward(req, path);
}