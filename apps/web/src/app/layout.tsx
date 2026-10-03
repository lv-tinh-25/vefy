import type { Metadata } from "next";
import { getAppOrigin } from "@vefy/api/origin";
import { Sora, Outfit } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { SWRActivityProvider } from "@/lib/swr-activity";
import { RefreshIndicator } from "@/components/core/atoms/RefreshIndicator";
import { Toaster } from "sonner";
import "./globals.css";

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sora",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

const DESCRIPTION = "Ứng dụng quản lý xe cá nhân, theo dõi bảo hành, giấy tờ, nhớt và phụ tùng";

export const metadata: Metadata = {
  metadataBase: new URL(getAppOrigin()),
  applicationName: "Vefy",
  title: { default: "Vefy - Quản lý xe cá nhân", template: "%s · Vefy" },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Vefy",
    locale: "vi_VN",
    title: "Vefy - Quản lý xe cá nhân",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  // Google Search Console HTML-tag verification; set the token in Vercel env
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${sora.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("vefy-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <I18nProvider>
            <SWRActivityProvider>
              <RefreshIndicator />
              {children}
            </SWRActivityProvider>
          </I18nProvider>
        </ThemeProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "var(--font-outfit), sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
