"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import enMessages from "../../messages/en.json";
import amMessages from "../../messages/am.json";

type Language = "en" | "am";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const currentLocale = useLocale() as Language;
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    function updateLanguageState(currentLocale: Language) {
      setLanguageState(currentLocale);
    }

    if (currentLocale) {
      updateLanguageState(currentLocale);
    }
  }, [currentLocale]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("hotel-order-lang", lang);

    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;

    window.location.reload();
  };

  const nextIntlTranslate = useTranslations();

  const resolveFromLocal = (key: string) => {
    if (!key || typeof key !== "string") return undefined;
    const msgs = language === "am" ? amMessages : enMessages;
    return key
      .split(".")
      .reduce((obj: any | undefined | object, part: string) => {
        if (obj && typeof obj === "object" && part in obj) return obj[part];
        return undefined;
      }, msgs);
  };

  const t = (key: string): string => {
    if (!key || typeof key !== "string") return "";
    try {
      const translated =
        typeof nextIntlTranslate === "function"
          ? nextIntlTranslate(key)
          : undefined;

      if (typeof translated === "string" && translated.length > 0) {
        return translated;
      }
    } catch (error) {
      console.warn(`Translation fallback triggered for key "${key}":`, error);
    }
    return resolveFromLocal(key) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
