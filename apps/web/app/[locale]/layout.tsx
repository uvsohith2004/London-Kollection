import { Noto_Sans_Arabic, Inter, Lora } from "next/font/google"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { DirectionProvider } from "@radix-ui/react-direction"
import { notFound } from "next/navigation"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { Navbar } from "@/components/navbar"
import { cn } from "@workspace/ui/lib/utils";

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
      <body className="min-h-dvh flex flex-col" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <DirectionProvider dir={dir}>
            <QueryProvider>
              <ThemeProvider>
                <Navbar />
                <main className="flex-1 md:pb-0 pb-16">
                  {children}
                </main>
              </ThemeProvider>
            </QueryProvider>
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
