import type { ParseKeys } from "i18next";

import i18n from "@locale";

export interface Country {
  code: string;
  name: string;
  flag: string;
}

interface CountryData {
  code: ParseKeys<"countries">;
  flag: string;
}

const COUNTRY_DATA: CountryData[] = [
  { code: "US", flag: "🇺🇸" },
  { code: "CA", flag: "🇨🇦" },
  { code: "MX", flag: "🇲🇽" },

  { code: "CR", flag: "🇨🇷" },
  { code: "GT", flag: "🇬🇹" },
  { code: "HN", flag: "🇭🇳" },
  { code: "NI", flag: "🇳🇮" },
  { code: "PA", flag: "🇵🇦" },
  { code: "SV", flag: "🇸🇻" },
  { code: "DO", flag: "🇩🇴" },

  { code: "AR", flag: "🇦🇷" },
  { code: "BO", flag: "🇧🇴" },
  { code: "BR", flag: "🇧🇷" },
  { code: "CL", flag: "🇨🇱" },
  { code: "CO", flag: "🇨🇴" },
  { code: "EC", flag: "🇪🇨" },
  { code: "GY", flag: "🇬🇾" },
  { code: "PY", flag: "🇵🇾" },
  { code: "PE", flag: "🇵🇪" },
  { code: "SR", flag: "🇸🇷" },
  { code: "UY", flag: "🇺🇾" },
  { code: "VE", flag: "🇻🇪" },

  { code: "AT", flag: "🇦🇹" },
  { code: "BE", flag: "🇧🇪" },
  { code: "CH", flag: "🇨🇭" },
  { code: "DE", flag: "🇩🇪" },
  { code: "FR", flag: "🇫🇷" },
  { code: "GB", flag: "🇬🇧" },
  { code: "IE", flag: "🇮🇪" },
  { code: "LU", flag: "🇱🇺" },
  { code: "NL", flag: "🇳🇱" },

  { code: "AD", flag: "🇦🇩" },
  { code: "CY", flag: "🇨🇾" },
  { code: "ES", flag: "🇪🇸" },
  { code: "GR", flag: "🇬🇷" },
  { code: "IT", flag: "🇮🇹" },
  { code: "MT", flag: "🇲🇹" },
  { code: "PT", flag: "🇵🇹" },

  { code: "DK", flag: "🇩🇰" },
  { code: "EE", flag: "🇪🇪" },
  { code: "FI", flag: "🇫🇮" },
  { code: "IS", flag: "🇮🇸" },
  { code: "LT", flag: "🇱🇹" },
  { code: "LV", flag: "🇱🇻" },
  { code: "NO", flag: "🇳🇴" },
  { code: "SE", flag: "🇸🇪" },

  { code: "BG", flag: "🇧🇬" },
  { code: "CZ", flag: "🇨🇿" },
  { code: "HU", flag: "🇭🇺" },
  { code: "MD", flag: "🇲🇩" },
  { code: "PL", flag: "🇵🇱" },
  { code: "RO", flag: "🇷🇴" },
  { code: "RU", flag: "🇷🇺" },
  { code: "SK", flag: "🇸🇰" },
  { code: "UA", flag: "🇺🇦" },

  { code: "AE", flag: "🇦🇪" },
  { code: "BH", flag: "🇧🇭" },
  { code: "IL", flag: "🇮🇱" },
  { code: "JO", flag: "🇯🇴" },
  { code: "KW", flag: "🇰🇼" },
  { code: "LB", flag: "🇱🇧" },
  { code: "OM", flag: "🇴🇲" },
  { code: "QA", flag: "🇶🇦" },
  { code: "SA", flag: "🇸🇦" },
  { code: "TR", flag: "🇹🇷" },

  { code: "DZ", flag: "🇩🇿" },
  { code: "EG", flag: "🇪🇬" },
  { code: "KE", flag: "🇰🇪" },
  { code: "MA", flag: "🇲🇦" },
  { code: "NG", flag: "🇳🇬" },
  { code: "TN", flag: "🇹🇳" },
  { code: "ZA", flag: "🇿🇦" },

  { code: "BD", flag: "🇧🇩" },
  { code: "CN", flag: "🇨🇳" },
  { code: "HK", flag: "🇭🇰" },
  { code: "ID", flag: "🇮🇩" },
  { code: "IN", flag: "🇮🇳" },
  { code: "JP", flag: "🇯🇵" },
  { code: "KH", flag: "🇰🇭" },
  { code: "KR", flag: "🇰🇷" },
  { code: "LA", flag: "🇱🇦" },
  { code: "MM", flag: "🇲🇲" },
  { code: "MN", flag: "🇲🇳" },
  { code: "MY", flag: "🇲🇾" },
  { code: "PH", flag: "🇵🇭" },
  { code: "PK", flag: "🇵🇰" },
  { code: "SG", flag: "🇸🇬" },
  { code: "TH", flag: "🇹🇭" },
  { code: "TW", flag: "🇹🇼" },
  { code: "VN", flag: "🇻🇳" },

  { code: "AU", flag: "🇦🇺" },
  { code: "FJ", flag: "🇫🇯" },
  { code: "NZ", flag: "🇳🇿" },
];

export const DEFAULT_COUNTRY = "US";

export function getCountryName(code: ParseKeys<"countries">): string {
  return i18n.t(`countries:${code}`);
}

function toCountry(data: CountryData): Country {
  return {
    code: data.code,
    get name() {
      return getCountryName(data.code);
    },
    flag: data.flag,
  };
}

export const COUNTRIES: Country[] = COUNTRY_DATA.map(toCountry);

export function getCountryByCode(code: string): Country | undefined {
  const data = COUNTRY_DATA.find((c) => c.code === code);
  return data ? toCountry(data) : undefined;
}

export function isValidCountryCode(code: string): boolean {
  return COUNTRY_DATA.some((c) => c.code === code);
}

export function getValidCountryOrFallback(code: string | undefined | null): string {
  if (code && isValidCountryCode(code)) {
    return code;
  }
  return detectBrowserCountry();
}

export function detectBrowserCountry(): string {
  if (typeof navigator === "undefined") return DEFAULT_COUNTRY;

  const locale = navigator.language || navigator.languages?.[0] || "";
  const countryCode = locale.split("-")[1]?.toUpperCase();

  if (countryCode && COUNTRY_DATA.some((c) => c.code === countryCode)) {
    return countryCode;
  }
  return DEFAULT_COUNTRY;
}
