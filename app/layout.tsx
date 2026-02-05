import { Toaster } from "@components/ui/Sonner";
import { CountryProvider } from "@modules/providers/CountryProvider";
import { TRPCProvider } from "@modules/providers/TRPCProvider";
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
          <TRPCProvider>
            <CountryProvider>{children}</CountryProvider>
          </TRPCProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
