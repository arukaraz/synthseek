export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },

  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "PA", name: "Panama", flag: "🇵🇦" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴" },

  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "GY", name: "Guyana", flag: "🇬🇾" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "SR", name: "Suriname", flag: "🇸🇷" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },

  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },

  { code: "AD", name: "Andorra", flag: "🇦🇩" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },

  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },

  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "MD", name: "Moldova", flag: "🇲🇩" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },

  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "JO", name: "Jordan", flag: "🇯🇴" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },

  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },

  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "LA", name: "Laos", flag: "🇱🇦" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },

  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "FJ", name: "Fiji", flag: "🇫🇯" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
];

export const DEFAULT_COUNTRY = "US";

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function isValidCountryCode(code: string): boolean {
  return COUNTRIES.some((c) => c.code === code);
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

  if (countryCode && COUNTRIES.some((c) => c.code === countryCode)) {
    return countryCode;
  }
  return DEFAULT_COUNTRY;
}
