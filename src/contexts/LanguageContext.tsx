import { createContext, useContext, ReactNode } from 'react';
import { translations, TranslationKey } from '../translations';

interface LanguageContextValue {
  lang: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  t: (key) => translations.en[key] ?? key,
});

export function LanguageProvider({ lang, children }: { lang: string; children: ReactNode }) {
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[lang] ?? translations.en;
    let str = dict[key] ?? translations.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  };

  return <LanguageContext.Provider value={{ lang, t }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
