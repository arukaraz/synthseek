import { Toaster } from "@components/ui/Toaster";
import { TooltipProvider } from "@components/ui/Tooltip";
import { DEFAULT_LOCALE, isLocale, LANG_COOKIE } from "@locale/config";
import { AuthProvider } from "@modules/providers/AuthProvider";
import { ClientSessionIdProvider } from "@modules/providers/ClientSessionIdProvider";
import { CountryProvider } from "@modules/providers/CountryProvider";
import { I18nProvider } from "@modules/providers/I18nProvider";
import { TRPCProvider } from "@modules/providers/TRPCProvider";
import { fontVariables } from "@theme/fonts";
import "@theme/index.css";
import { AVAILABLE_THEMES, ThemeProvider } from "@theme/ThemeProvider";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Synthseek",
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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${fontVariables} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          themes={AVAILABLE_THEMES}
          disableTransitionOnChange
        >
          <ClientSessionIdProvider>
            <TRPCProvider>
              <AuthProvider>
                <TooltipProvider delayDuration={150} skipDelayDuration={0}>
                  <I18nProvider locale={locale}>
                    <CountryProvider>{children}</CountryProvider>
                  </I18nProvider>
                </TooltipProvider>
              </AuthProvider>
            </TRPCProvider>
          </ClientSessionIdProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
