
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import en from '@/locales/en.json';
import pt from '@/locales/pt.json';

type Locale = 'en' | 'pt';

const translations = { en, pt };

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'openwritingkit-locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (storedLocale && (storedLocale === 'en' || storedLocale === 'pt')) {
        setLocaleState(storedLocale);
      } else {
        // Fallback to browser language if available, otherwise default to 'en'
        const browserLang = navigator.language.split('-')[0];
        setLocaleState(browserLang === 'pt' ? 'pt' : 'en');
      }
      setIsLoaded(true);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
    setLocaleState(newLocale);
  };

  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    let lang = translations[locale];
    if (!lang) {
      lang = translations.en;
    }
    
    let translation = key.split('.').reduce((obj: any, k: string) => (obj ? obj[k] : undefined), lang);

    if (translation === undefined) {
      // Fallback to English if key not found in current locale
      translation = key.split('.').reduce((obj: any, k: string) => (obj ? obj[k] : undefined), translations.en);
    }
    
    if (translation === undefined) {
        console.warn(`Translation not found for key: ${key}`);
        return key;
    }

    if (options) {
      Object.keys(options).forEach(optionKey => {
        translation = translation.replace(`{{${optionKey}}}`, String(options[optionKey]));
      });
    }

    return translation;
  }, [locale]);


  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
