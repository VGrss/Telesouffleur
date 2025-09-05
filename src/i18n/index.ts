import { create } from 'zustand';
import enTranslations from './en.json';
import frTranslations from './fr.json';

export type Locale = 'en' | 'fr';

interface TranslationValue {
  [key: string]: string | TranslationValue;
}

interface Translations {
  [key: string]: TranslationValue;
}

const translations: Record<Locale, Translations> = {
  en: enTranslations,
  fr: frTranslations,
};

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// Detect browser language
const detectLocale = (): Locale => {
  const saved = localStorage.getItem('teleprompter-locale') as Locale;
  if (saved && translations[saved]) return saved;
  
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'fr') return 'fr';
  return 'en';
};

export const useI18n = create<I18nState>((set, get) => ({
  locale: detectLocale(),
  
  setLocale: (locale: Locale) => {
    localStorage.setItem('teleprompter-locale', locale);
    set({ locale });
  },
  
  t: (key: string, params?: Record<string, string | number>): string => {
    const { locale } = get();
    const keys = key.split('.');
    let value: any = translations[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found anywhere
          }
        }
        break;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Replace parameters
    if (params) {
      return Object.entries(params).reduce((str, [param, val]) => {
        return str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(val));
      }, value);
    }
    
    return value;
  },
}));