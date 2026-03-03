import en from './en.json';
import es from './es.json';
import pt from './pt.json';

export type Locale = 'en' | 'es' | 'pt';

// Use English translations as the base type
type Translations = typeof en;

const translations: Record<Locale, Translations> = {
  en,
  es: es as unknown as Translations,
  pt: pt as unknown as Translations,
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations.en;
}

export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  const trans = getTranslations(locale);
  
  let value: any = trans;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  let result = value || key;
  
  // Replace {key} placeholders with params
  if (params && typeof result === 'string') {
    Object.entries(params).forEach(([key, val]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    });
  }
  
  return result;
}

// Helper to get locale-aware URLs
export function getLocalizedPath(path: string, locale: Locale): string {
  if (locale === 'en') return path;
  return `/${locale}${path}`;
}
