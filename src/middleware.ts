import { defineMiddleware, sequence } from "astro:middleware";
import { middleware } from "astro:i18n";
import {
  getLocaleFromCookie,
  buildLocaleCookieHeader,
  SUPPORTED_LOCALES,
  SupportedLocale,
} from "@/lib/locale-cookie";

const BACKEND_AUTH_URL =
  import.meta.env.PUBLIC_BETTER_AUTH_URL || "http://localhost:5000";

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
    const response = await fetch(`${BACKEND_AUTH_URL}/api/auth/get-session`, {
      headers: { cookie },
    });

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

const routesWithoutProfileCompletedCheck = [
  "/",
  "/create-profile",
  "/es",
  "/es/create-profile",
];

const profileCompletedMiddleware = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  const segments = pathname.split("/");
  const pathWithoutLocale = SUPPORTED_LOCALES.includes(
    segments[1] as SupportedLocale,
  )
    ? "/" + segments.slice(2).join("/")
    : pathname;

  if (pathWithoutLocale.startsWith("/api")) {
    return next();
  }

  if (routesWithoutProfileCompletedCheck.includes(pathWithoutLocale))
    return next();

  const user = context.locals.user;
  console.log(user);
  if (!user) return context.redirect("/");

  if (!user.profileCompleted) {
    const locale = context.currentLocale || "en";
    return context.redirect(
      `/${locale === "en" ? "" : locale + "/"}create-profile`.replace(
        "//",
        "/",
      ),
    );
  }

  return next();
});

/**
 * Reads the `preferred-locale` cookie and, when it differs from the locale
 * encoded in the request URL, issues a 302 redirect to the same path/query
 * under the preferred locale.
 *
 * This runs server-side before Astro renders anything, so there is no
 * client-side flash and no double page fetch — the first request is just a
 * lightweight redirect (no body rendered).
 *
 * Skipped for:
 *   - API routes        (/api/*)
 *   - Astro assets      (/_astro/*)
 *   - Static files      (anything with a file extension in the path)
 *   - No cookie set     (first visit — URL locale wins)
 */
const localePreferenceMiddleware = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;

  // Skip non-page paths
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_astro/") ||
    // Anything that looks like a static asset (has an extension)
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return next();
  }

  // Skip if this is an internal Astro rewrite (e.g. i18n fallback re-running
  // the middleware pipeline). Without this guard, the i18n fallback rewrite
  // from /es/ → / would re-trigger our redirect back to /es/, causing an
  // infinite loop.
  //
  // Astro always sets `astro.originPathname` on the request (even for normal
  // requests), so we can't just check for its presence. Instead, we compare
  // it against the current URL: on a normal request they are the same path;
  // on a rewrite they differ (originPathname is the *pre-rewrite* path).
  const encodedOrigin = Reflect.get(
    context.request,
    Symbol.for("astro.originPathname"),
  ) as string | undefined;
  const originPathname = encodedOrigin
    ? decodeURIComponent(encodedOrigin)
    : null;
  // Normalise trailing slashes before comparing
  const normCurrent = pathname.replace(/\/$/, "") || "/";
  const normOrigin = originPathname
    ? originPathname.replace(/\/$/, "") || "/"
    : null;
  const isRewrite = normOrigin !== null && normOrigin !== normCurrent;
  if (isRewrite) return next();

  const cookieHeader = context.request.headers.get("cookie");
  const preferredLocale = getLocaleFromCookie(cookieHeader) ?? "en";

  // If no cookie exists yet, set the default (en) and fall through to
  // redirect logic — so a first-time visitor landing on /es/... is
  // immediately redirected to the English version.
  const setCookieHeader =
    getLocaleFromCookie(cookieHeader) === null
      ? buildLocaleCookieHeader("en")
      : null;

  // Detect the locale currently encoded in the URL
  const urlLocale =
    pathname.startsWith("/es/") || pathname === "/es"
      ? "es"
      : pathname.startsWith("/pt/") || pathname === "/pt"
        ? "pt"
        : "en";

  // Already on the right locale — just pass through (setting cookie if needed)
  if (preferredLocale === urlLocale) {
    const response = await next();
    if (setCookieHeader) response.headers.append("Set-Cookie", setCookieHeader);
    return response;
  }

  // Build the new path under the preferred locale
  const stripped = pathname.replace(/^\/(es|pt)/, "") || "/";
  const newPath =
    preferredLocale === "en" ? stripped : `/${preferredLocale}${stripped}`;

  const redirectResponse = context.redirect(newPath + search, 302);
  if (setCookieHeader)
    redirectResponse.headers.append("Set-Cookie", setCookieHeader);
  return redirectResponse;
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

export const onRequest = sequence(
  authMiddleware,
  localePreferenceMiddleware,
  i18nMiddleware,
  profileCompletedMiddleware,
);
