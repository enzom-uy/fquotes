import type { APIRoute } from "astro";

const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || "http://localhost:5000/api";
const BACKEND_AUTH_URL = import.meta.env.PUBLIC_BETTER_AUTH_URL || "http://localhost:5000";

export const ALL: APIRoute = async ({ request, params }) => {
  const path = params.path || "";
  
  // Determine if this is an auth route or a regular API route
  const isAuthRoute = path.startsWith("auth/");
  const baseURL = isAuthRoute ? BACKEND_AUTH_URL : BACKEND_URL;
  
  // Build the target URL
  const url = new URL(request.url);
  // For auth routes: BACKEND_AUTH_URL + /api/auth/... 
  // For API routes: BACKEND_URL + /... (BACKEND_URL already includes /api)
  const targetPath = isAuthRoute ? `/api/${path}` : `/${path}`;
  const targetURL = `${baseURL}${targetPath}${url.search}`;
  
  // Clone headers and update host
  const headers = new Headers(request.headers);
  headers.set("host", new URL(baseURL).host);
  headers.delete("connection");
  
  // Get request body if applicable
  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;
  
  // Forward request to backend
  const response = await fetch(targetURL, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  });
  
  // Clone response headers
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("transfer-encoding");
  
  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export const GET = ALL;
export const POST = ALL;
export const PATCH = ALL;
export const DELETE = ALL;
export const PUT = ALL;
