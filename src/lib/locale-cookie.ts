export const LOCALE_COOKIE_NAME = "preferred-locale";
export const SUPPORTED_LOCALES = ["en", "es", "pt"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Parse the preferred-locale cookie from a Cookie header string. */
export function getLocaleFromCookie(
  cookieHeader: string | null,
): SupportedLocale | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, value] = part.trim().split("=");
    if (key === LOCALE_COOKIE_NAME && isValidLocale(value)) {
      return value;
    }
  }
  return null;
}

export function isValidLocale(value: string | undefined): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

/**
 * Returns a Set-Cookie header value that persists the locale preference for
 * 1 year. SameSite=Lax is sufficient — the cookie is never needed cross-site.
 */
export function buildLocaleCookieHeader(locale: SupportedLocale): string {
  const maxAge = 365 * 24 * 60 * 60;
  return `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}
