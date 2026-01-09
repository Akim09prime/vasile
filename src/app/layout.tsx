
import type { Metadata, Viewport } from "next";
import { i18n, type Locale } from "@/lib/i18n-config";
import { PT_Sans, Playfair_Display } from 'next/font/google'

import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ThemeApplicator } from '@/components/ThemeApplicator';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair-display',
})


export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export const metadata: Metadata = {
  title: "CARVELLO - Mobilier la comandă, precizie milimetrică.",
  description:
    "Proiectare. CNC. Finisaj 2K. Montaj. Totul sub control, de la schiță la rezultat.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "black" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}>) {

  const { lang } = await params;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${ptSans.variable} ${playfairDisplay.variable} font-body antialiased`} suppressHydrationWarning>
        <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
                <ThemeApplicator />
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                </div>
                <Toaster />
                <FirebaseErrorListener />
            </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
