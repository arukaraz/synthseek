"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { DEFAULT_COUNTRY, getValidCountryOrFallback } from "@utils/countries";
import { trpc } from "@utils/trpc";

interface CountryContextValue {
  country: string;
  setCountry: (code: string) => void;
}

const CountryContext = createContext<CountryContextValue | null>(null);

const STORAGE_KEY = "synthseek-country";

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState(DEFAULT_COUNTRY);
  const [needsDetection, setNeedsDetection] = useState(false);

  const { data } = trpc.music.detectCountry.useQuery(undefined, {
    enabled: needsDetection,
    staleTime: Infinity,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCountryState(stored);
    } else {
      setNeedsDetection(true);
    }
  }, []);

  useEffect(() => {
    if (data?.country && needsDetection) {
      const validCountry = getValidCountryOrFallback(data.country);
      setCountryState(validCountry);
      localStorage.setItem(STORAGE_KEY, validCountry);
    }
  }, [data, needsDetection]);

  const setCountry = (code: string) => {
    setCountryState(code);
    localStorage.setItem(STORAGE_KEY, code);
  };

  return <CountryContext.Provider value={{ country, setCountry }}>{children}</CountryContext.Provider>;
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used within CountryProvider");
  }
  return context;
}
