import { auth } from "@/lib/auth";
import { APIRoute } from "astro";

export const ALL: APIRoute = async (ctx) => {
  const response = await auth.handler(ctx.request);

  if (!response) {
    return new Response(null, { status: 401 });
  }

  console.log("CALLBACK HIT");
  console.log("COOKIES:", ctx.request.headers.get("cookie"));

  return response;
};
