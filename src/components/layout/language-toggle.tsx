

'use client'

import { Languages } from "lucide-react"
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Locale } from "@/lib/i18n-config"
import { i18n } from "@/lib/i18n-config"
import Link from "next/link";
import { useEffect } from "react";

const COOKIE_NAME = 'NEXT_LOCALE';

export function LanguageToggle({ lang }: { lang: Locale }) {
  const pathname = usePathname();

  useEffect(() => {
    // This effect ensures the cookie is set to the current language
    // if it's not set already, synchronizing it with the URL.
    const currentCookieLang = Cookies.get(COOKIE_NAME);
    if (currentCookieLang !== lang) {
      Cookies.set(COOKIE_NAME, lang, { expires: 365, path: '/' });
    }
  }, [lang]);

  const redirectedPathName = (locale: Locale) => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    segments[1] = locale;
    return segments.join('/');
  };

  const handleLocaleChange = (locale: Locale) => {
     Cookies.set(COOKIE_NAME, locale, { expires: 365, path: '/' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i18n.locales.map(locale => (
            <DropdownMenuItem key={locale} asChild disabled={lang === locale} onClick={() => handleLocaleChange(locale)}>
                 <Link href={redirectedPathName(locale)}>{locale.toUpperCase()}</Link>
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
