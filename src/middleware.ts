import { defineMiddleware, sequence } from "astro:middleware";
import { middleware } from "astro:i18n";

const BACKEND_AUTH_URL = import.meta.env.PUBLIC_BETTER_AUTH_URL || "http://localhost:5000";

const authMiddleware = defineMiddleware(async (context, next) => {
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

// Astro's i18n middleware with manual routing:
// - Recognises /es/* and /pt/* as valid locale prefixes
// - Rewrites them internally to the base pages (e.g. /es/quotes -> /quotes)
//   while keeping Astro.currentLocale = "es"
// - prefixDefaultLocale: false → /en/ prefix is NOT added for English
// - redirectToDefaultLocale: false → / is not redirected to /en/
const i18nMiddleware = middleware({
  prefixDefaultLocale: false,
  redirectToDefaultLocale: false,
  fallbackType: "rewrite",
});

export const onRequest = sequence(authMiddleware, i18nMiddleware);
