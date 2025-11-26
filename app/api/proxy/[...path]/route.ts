import { NextRequest } from "next/server"

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
])

function filterHeaders(src: Headers): Headers {
  const out = new Headers()
  for (const [key, value] of src) {
    if (HOP_BY_HOP.has(key.toLowerCase())) continue
    // avoid leaking host-related headers from client
    if (key.toLowerCase() === "host") continue
    out.set(key, value)
  }
  return out
}

function joinPaths(basePath: string, appendPath?: string) {
  if (!appendPath) return basePath
  const base = basePath.replace(/\/+$/, "")
  const append = appendPath.replace(/^\/+/, "")
  return `${base}/${append}`
}

async function proxyHandler(req: NextRequest, paramsOrCtx?: any) {
  try {
    // `paramsOrCtx` may be one of:
    // - the `params` object { path?: string[] }
    // - the full `context` object { params: ... }
    // - a Promise that resolves to the above (Next's types sometimes use Promise)
    let params = paramsOrCtx
    if (params && typeof params.then === "function") {
      params = await params
    }
    if (params && params.params) {
      params = params.params
    }

    const pathSegments = Array.isArray(params?.path) ? params.path : []
    const pathStr = pathSegments.join("/")

    const backendBase = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
    if (!backendBase) {
      return new Response(JSON.stringify({ message: "Backend base URL not configured" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      })
    }

    const target = new URL(backendBase)
    // merge path
    target.pathname = joinPaths(target.pathname || "", pathStr)
    // forward query string
    target.search = req.nextUrl.search

    const outboundHeaders = filterHeaders(req.headers)
    // Forward Authorization if present
    // Note: we intentionally do not forward Host header

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: outboundHeaders,
      // `req.body` is a ReadableStream in NextRequest and can be forwarded directly
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
      // Do not follow redirects automatically; mirror status instead
      redirect: "manual",
    }

    const res = await fetch(target.toString(), fetchOptions)

    // Filter response headers
    const resHeaders = filterHeaders(res.headers)

    // Optional: if backend sets cookies and you want to forward them to client,
    // you can copy 'set-cookie' header(s). Keep as-is here (note: some runtimes
    // don't allow setting multiple Set-Cookie via Headers easily).

    // Stream response back to client preserving status and headers
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    })
  } catch (err) {
    // Unexpected error -> return 502 Bad Gateway-like response
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ message: "Proxy error", detail: message }), {
      status: 502,
      headers: { "content-type": "application/json" },
    })
  }
}

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, ctx: any) {
  return proxyHandler(req, ctx)
}
export async function POST(req: NextRequest, ctx: any) {
  return proxyHandler(req, ctx)
}
export async function PUT(req: NextRequest, ctx: any) {
  return proxyHandler(req, ctx)
}
export async function PATCH(req: NextRequest, ctx: any) {
  return proxyHandler(req, ctx)
}
export async function DELETE(req: NextRequest, ctx: any) {
  return proxyHandler(req, ctx)
}
export async function OPTIONS(req: NextRequest, ctx: any) {
  // respond to preflight quickly
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD",
      "access-control-allow-headers": "*",
    },
  })
}

export async function HEAD(req: NextRequest, ctx: any) {
  return proxyHandler(req, ctx)
}
