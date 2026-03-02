import type { APIRoute } from "astro";

const BACKEND_AUTH_URL = import.meta.env.PUBLIC_BETTER_AUTH_URL;

export const ALL: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const targetURL = `${BACKEND_AUTH_URL}${url.pathname}${url.search}`;
  const headers = new Headers(request.headers);

  headers.set("host", new URL(BACKEND_AUTH_URL).host);
  headers.delete("connection");

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;
  const response = await fetch(targetURL, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers(response.headers);

  responseHeaders.delete("transfer-encoding");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export const GET = ALL;
export const POST = ALL;
