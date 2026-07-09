import { Noto_Sans_Arabic, Inter, Lora } from "next/font/google"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { DirectionProvider } from "@radix-ui/react-direction"
import { notFound } from "next/navigation"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { SettingsProvider } from "@/components/providers/settings-provider"
import { Navbar } from "@/components/navbar"
import { cn } from "@workspace/ui/lib/utils";
import { getStoreSettings } from "@/lib/api"

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
    const settingsRes = await getStoreSettings();
    if (settingsRes?.data) {
      initialSettings = settingsRes.data;
    }
  } catch (e) {
    console.error("Failed to fetch store settings", e)
  }

  // Determine direction based on locale
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedColor = localStorage.getItem('theme-color');
                if (savedColor && savedColor !== 'zinc') {
                  document.documentElement.setAttribute('data-theme', savedColor);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-dvh flex flex-col" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <DirectionProvider dir={dir}>
            <QueryProvider>
              <SettingsProvider initialSettings={initialSettings}>
                <ThemeProvider>
                  <Navbar />
                  <main className="flex-1 md:pb-0 pb-16">
                    {children}
                  </main>
                </ThemeProvider>
              </SettingsProvider>
            </QueryProvider>
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
