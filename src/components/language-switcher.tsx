"use client";

import { useState, useEffect } from "react";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALE_COOKIE_NAME } from "@/lib/locale-cookie";

const locales = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  pt: { name: "Português", flag: "🇵🇹" },
} as const;

type Locale = keyof typeof locales;

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");

  useEffect(() => {
    // Detect current locale from URL
    const path = window.location.pathname;
    if (path.startsWith("/es")) {
      setCurrentLocale("es");
    } else if (path.startsWith("/pt")) {
      setCurrentLocale("pt");
    } else {
      setCurrentLocale("en");
    }
  }, []);

  const switchLocale = (newLocale: Locale) => {
    // Persist preference in a cookie so the middleware can redirect future
    // requests (including shared links) to the user's preferred locale
    // without any client-side flash or double page fetch.
    const maxAge = 365 * 24 * 60 * 60;
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;

    const currentPath = window.location.pathname;
    let newPath = currentPath;

    // Remove current locale prefix if exists
    if (currentPath.startsWith("/es")) {
      newPath = currentPath.replace(/^\/es/, "");
    } else if (currentPath.startsWith("/pt")) {
      newPath = currentPath.replace(/^\/pt/, "");
    }

    // Add new locale prefix (unless it's English, which is default)
    if (newLocale !== "en") {
      newPath = `/${newLocale}${newPath || "/"}`;
    } else {
      newPath = newPath || "/";
    }

    // Navigate to new URL
    window.location.href = newPath;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-muted transition-colors">
        <Languages size={18} />
        <span className="hidden sm:inline">{locales[currentLocale].flag}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(Object.keys(locales) as Locale[]).map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={currentLocale === locale ? "bg-primary/10 text-primary" : ""}
          >
            <span className="mr-2">{locales[locale].flag}</span>
            {locales[locale].name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
