import { Metadata } from "next"
import { Noto_Sans_Arabic, Inter, Lora } from "next/font/google"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { DirectionProvider } from "@radix-ui/react-direction"
import { notFound } from "next/navigation"
import Script from "next/script"

import { serverApi } from "@/api-client/server"

export async function generateMetadata(): Promise<Metadata> {
  let settings;
  try {
    settings = await serverApi.get("/store/settings");
  } catch (e) {
    console.error("Failed to fetch store settings for metadata", e)
  }

  const siteName = settings?.siteName || "London Kollection";
  const description = settings?.storeDescription || "Discover the latest trends in fashion and lifestyle.";
  const logoUrl = settings?.logoUrl?.avif?.url || settings?.logoUrl?.webp?.url || settings?.logoUrl?.url || settings?.logoUrl;
  const logoDarkUrl = settings?.logoDarkUrl?.avif?.url || settings?.logoDarkUrl?.webp?.url || settings?.logoDarkUrl?.url || settings?.logoDarkUrl;

  const lightIcon = logoUrl || "/favicon.ico";
  const darkIcon = logoDarkUrl || lightIcon;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://londonkollection.com";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: description,
    keywords: ["fashion", "clothing", "lifestyle", "shopping", siteName],
    icons: [
      { url: lightIcon, media: '(prefers-color-scheme: light)' },
      { url: darkIcon, media: '(prefers-color-scheme: dark)' }
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      title: siteName,
      description: description,
      siteName: siteName,
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: siteName }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: description,
      images: logoUrl ? [logoUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}


import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { SettingsProvider } from "@/components/providers/settings-provider"
import { CurrencyProvider } from "@/components/providers/currency-provider"
import { Navbar } from "@/components/navbar"
import { InteractionTracker } from "@/components/providers/interaction-tracker"
import { cn } from "@workspace/ui/lib/utils";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { FloatingSocialButton } from "@/components/floating-social-button"
const loraHeading = Lora({ subsets: ['latin'], variable: '--font-heading' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic-sans" });

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  // Ensure the locale is supported
  if (!['en', 'ar'].includes(locale)) notFound();

  // Fetch translation messages
  const messages = await getMessages();

  // Fetch global settings
  let initialSettings = undefined;
  try {
    const settingsRes = await serverApi.get("/store/settings");
    if (settingsRes) {
      initialSettings = settingsRes;
    }
  } catch (e) {
    console.error("Failed to fetch store settings", e)
  }


  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={cn(
        "antialiased", 
        locale === 'ar' ? notoArabic.variable : inter.variable, 
        loraHeading.variable,
        locale === 'ar' ? 'font-arabic-sans' : 'font-sans'
      )}
    >
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            try {
              var savedColor = localStorage.getItem('theme-color');
              if (savedColor && savedColor !== 'zinc') {
                document.documentElement.setAttribute('data-theme', savedColor);
              }
            } catch (e) {}
          `}
        </Script>
      </head>
      <body className="min-h-dvh flex flex-col" suppressHydrationWarning>

          
        <NextIntlClientProvider messages={messages} locale={locale}>
        <TooltipProvider>
          <DirectionProvider dir={dir}>
            <QueryProvider>
              <SettingsProvider initialSettings={initialSettings}>
                <CurrencyProvider>
                <InteractionTracker />
                <ThemeProvider>
                  <Navbar />
                  <main className="flex-1 md:pb-0 pb-16">
                    {children}
                  </main>
                  <FloatingSocialButton />
                </ThemeProvider>
                </CurrencyProvider>
              </SettingsProvider>
            </QueryProvider>
          </DirectionProvider>
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
