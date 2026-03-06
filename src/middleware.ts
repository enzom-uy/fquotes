import { defineMiddleware } from "astro:middleware";

const BACKEND_AUTH_URL = import.meta.env.PUBLIC_BETTER_AUTH_URL || "http://localhost:5000";

export const onRequest = defineMiddleware(async (context, next) => {
  const cookie = context.request.headers.get("cookie");
  if (!cookie) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }
  try {
    // Call backend directly to avoid middleware loop
    // (middleware would trigger again if we call our own /api/auth/get-session)
    const response = await fetch(
      `${BACKEND_AUTH_URL}/api/auth/get-session`,
      { headers: { cookie } }
    );
    
    if (response.ok) {
      const data = await response.json();
      context.locals.user = data.user;
      context.locals.session = data.session;
    } else {
      context.locals.user = null;
      context.locals.session = null;
    }
  } catch (error) {
    context.locals.user = null;
    context.locals.session = null;
  }
  return next();
});
