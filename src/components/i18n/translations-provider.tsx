"use client";

import { createContext, useContext, useMemo } from "react";

import type { Locale } from "@/i18n/config";

type Dictionary = Record<string, unknown>;

type TranslationsContextValue = {
  locale: Locale;
  dictionary: Dictionary;
};

const TranslationsContext = createContext<TranslationsContextValue | null>(null);

type TranslationsProviderProps = {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
};

export function TranslationsProvider({
  locale,
  dictionary,
  children,
}: TranslationsProviderProps) {
  const value = useMemo(
    () => ({
      locale,
      dictionary,
    }),
    [dictionary, locale],
  );

  return (
    <TranslationsContext.Provider value={value}>
      {children}
    </TranslationsContext.Provider>
  );
}

function getByPath(source: Dictionary, path: string) {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Dictionary | undefined)?.[key], source);
}

export function useTranslations(namespace?: string) {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error("useTranslations must be used within a TranslationsProvider");
  }

  const base = namespace
    ? (getByPath(context.dictionary, namespace) as Dictionary | undefined) ?? {}
    : context.dictionary;

  return (key: string, fallback?: string) => {
    const value = getByPath(base, key);
    if (typeof value === "string") return value;
    return fallback ?? key;
  };
}

export function useLocale() {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error("useLocale must be used within a TranslationsProvider");
  }
  return context.locale;
}

