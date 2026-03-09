import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { t, type Locale } from "@/i18n";

// ---------------------------------------------------------------------------
// Public event API
// ---------------------------------------------------------------------------

export type ToastVariant = "default" | "destructive" | "success";

export interface ToastEventPayload {
  titleKey: string;
  descriptionKey?: string;
  variant?: ToastVariant;
  /** Interpolation values for title/description (e.g. { count: "3" }) */
  interpolations?: Record<string, string>;
}

const TOAST_EVENT = "app:toast";

/**
 * Dispatch a toast from anywhere — React components, hooks, plain .ts files.
 *
 * Example:
 *   dispatchToastEvent({ titleKey: "quotesManager.quoteUpdated" });
 *   dispatchToastEvent({ titleKey: "quotesManager.quoteDeleted", variant: "destructive" });
 */
export function dispatchToastEvent(payload: ToastEventPayload) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: payload }));
}

// ---------------------------------------------------------------------------
// Query-param → toast mapping
// ---------------------------------------------------------------------------

type QueryParamToastConfig = {
  titleKey: string;
  descriptionKey?: string;
  variant?: ToastVariant;
};

const QUERY_PARAM_MAP: Record<string, QueryParamToastConfig> = {
  privateQuote: {
    titleKey: "quote.privateQuoteTitle",
    descriptionKey: "quote.privateQuoteDescription",
    variant: "destructive",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface GlobalToastManagerProps {
  locale: Locale;
}

function interpolate(
  str: string,
  values?: Record<string, string>,
): string {
  if (!values) return str;
  return Object.entries(values).reduce(
    (acc, [key, val]) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), val),
    str,
  );
}

export function GlobalToastManager({ locale }: GlobalToastManagerProps) {
  // -- Detect query params on mount --
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    for (const [param, config] of Object.entries(QUERY_PARAM_MAP)) {
      if (params.get(param) === "true") {
        toast({
          title: t(locale, config.titleKey),
          description: config.descriptionKey
            ? t(locale, config.descriptionKey)
            : undefined,
          variant: config.variant,
        });
      }
    }
  }, []);

  // -- Listen for programmatic toast events --
  useEffect(() => {
    const handler = (e: Event) => {
      const { titleKey, descriptionKey, variant, interpolations } = (
        e as CustomEvent<ToastEventPayload>
      ).detail;

      toast({
        title: interpolate(t(locale, titleKey), interpolations),
        description: descriptionKey
          ? interpolate(t(locale, descriptionKey), interpolations)
          : undefined,
        variant,
      });
    };

    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, [locale]);

  return null;
}
