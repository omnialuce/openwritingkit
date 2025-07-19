// src/contexts/LanguageContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import en from '@/locales/en.json';
import enGB from '@/locales/en-gb.json';
import pt from '@/locales/pt.json';

export type Language = 'en-US' | 'en-GB' | 'pt-BR';

// Helper to get nested keys from translation object
type NestedKey<T> = T extends object ? { [K in keyof T]: `${K & string}` | `${K & string}.${NestedKey<T[K]>}` }[keyof T] : never;
type TranslationKey = NestedKey<typeof en>;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const translations = { 'en-US': en, 'en-GB': enGB, 'pt-BR': pt };
const LANGUAGE_KEY = 'openwritingkit-language-v2';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en-US');

  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (storedLanguage && ['en-US', 'en-GB', 'pt-BR'].includes(storedLanguage)) {
      setLanguageState(storedLanguage);
      document.documentElement.lang = storedLanguage;
    } else {
      document.documentElement.lang = 'en-US';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  const t = useCallback((key: TranslationKey, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let result: any = translations[language];

    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if key not found
        let fallbackResult: any = translations['en-US'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if(fallbackResult === undefined) return key;
        }
        result = fallbackResult;
        break;
      }
    }

    let str = typeof result === 'string' ? result : key;

    if (params) {
      Object.keys(params).forEach(pKey => {
        str = str.replace(new RegExp(`{{${pKey}}}`, 'g'), params[pKey]);
      });
    }

    return str;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
