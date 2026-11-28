import { PageTitle } from "@components/PageTitle";
import { TruncationTitles } from "@components/TruncationTitles";
import { Toaster } from "@components/ui/Toaster";
import { TooltipProvider } from "@components/ui/Tooltip";
import { DEFAULT_LOCALE, isLocale, LANG_COOKIE } from "@locale/config";
import {
  accessibilityAttributesOf,
  ACCESSIBILITY_COOKIE,
  parseAccessibilityCookie,
  parseTextSize,
  TEXT_SIZE_COOKIE,
  textSizeAttributesOf,
} from "@modules/accessibility";
import { AccessibilityProvider } from "@modules/providers/AccessibilityProvider";
import { AuthProvider } from "@modules/providers/AuthProvider";
import { ClientSessionIdProvider } from "@modules/providers/ClientSessionIdProvider";
import { CountryProvider } from "@modules/providers/CountryProvider";
import { I18nProvider } from "@modules/providers/I18nProvider";
import { MotionProvider } from "@modules/providers/MotionProvider";
import { TRPCProvider } from "@modules/providers/TRPCProvider";
import { fontVariables } from "@theme/fonts";
import "@theme/index.css";
import {
  parseThemeCookie,
  THEME_ATTRIBUTE,
  THEME_BASE_ATTRIBUTE,
  THEME_COOKIE,
  ThemeHead,
  ThemeProvider,
} from "@theme/ThemeProvider";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  description: "Intelligent music download and library management.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LANG_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const boot = parseThemeCookie(cookieStore.get(THEME_COOKIE)?.value);
  const themeAttributes = {
    [THEME_ATTRIBUTE]: boot.theme,
    ...(boot.theme === "custom" ? { [THEME_BASE_ATTRIBUTE]: boot.base } : {}),
  };

  const accessibilityBoot = parseAccessibilityCookie(cookieStore.get(ACCESSIBILITY_COOKIE)?.value);
  const textSizeBoot = parseTextSize(cookieStore.get(TEXT_SIZE_COOKIE)?.value);

  return (
    <html
      lang={locale}
      {...themeAttributes}
      {...accessibilityAttributesOf(accessibilityBoot)}
      {...textSizeAttributesOf(textSizeBoot)}
      suppressHydrationWarning
    >
      <head>
        <ThemeHead boot={boot} />
      </head>
      <body className={`${fontVariables} antialiased`} suppressHydrationWarning>
        <ClientSessionIdProvider>
          <TRPCProvider>
            <AuthProvider>
              <AccessibilityProvider boot={accessibilityBoot} textSizeBoot={textSizeBoot}>
                <ThemeProvider boot={boot}>
                  <TooltipProvider delayDuration={150} skipDelayDuration={0}>
                    <I18nProvider locale={locale}>
                      <MotionProvider>
                        <PageTitle />
                        <TruncationTitles />
                        <CountryProvider>{children}</CountryProvider>
                      </MotionProvider>
                    </I18nProvider>
                  </TooltipProvider>
                  <Toaster />
                </ThemeProvider>
              </AccessibilityProvider>
            </AuthProvider>
          </TRPCProvider>
        </ClientSessionIdProvider>
      </body>
    </html>
  );
}
