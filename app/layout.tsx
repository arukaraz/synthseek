import { Toaster } from "@components/ui/Sonner";
import { AuthProvider } from "@modules/providers/AuthProvider";
import { ClientSessionIdProvider } from "@modules/providers/ClientSessionIdProvider";
import { CountryProvider } from "@modules/providers/CountryProvider";
import { SettingsModalProvider } from "@modules/providers/SettingsModalProvider";
import { TRPCProvider } from "@modules/providers/TRPCProvider";
import { SettingsModal } from "@features/settings/SettingsModal/SettingsModal";
import { fontVariables } from "@theme/fonts";
import "@theme/index.css";
import { AVAILABLE_THEMES, ThemeProvider } from "@theme/ThemeProvider";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Synthseek",
  description: "Next.js 15 with App Router, TypeScript, Tailwind CSS 4.x, and shadcn/ui",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          themes={AVAILABLE_THEMES}
          disableTransitionOnChange
        >
          <ClientSessionIdProvider>
            <TRPCProvider>
              <AuthProvider>
                <SettingsModalProvider>
                  <CountryProvider>{children}</CountryProvider>
                  <SettingsModal />
                </SettingsModalProvider>
              </AuthProvider>
            </TRPCProvider>
          </ClientSessionIdProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
