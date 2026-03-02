import { defineMiddleware } from "astro:middleware";
export const onRequest = defineMiddleware(async (context, next) => {
  const cookie = context.request.headers.get("cookie");
  if (!cookie) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }
  try {
    const response = await fetch(
      `${import.meta.env.PUBLIC_BETTER_AUTH_URL}/api/auth/get-session`,
      { headers: { cookie } },
    );
    if (response.ok) {
      const data = await response.json();
      context.locals.user = data.user;
      context.locals.session = data.session;
    } else {
      context.locals.user = null;
      context.locals.session = null;
    }
  } catch {
    context.locals.user = null;
    context.locals.session = null;
  }
  return next();
});
