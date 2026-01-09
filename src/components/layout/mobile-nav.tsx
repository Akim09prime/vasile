

'use client'

import * as React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import type { NavItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/logo"
import type { Locale } from "@/lib/i18n-config"
import { LanguageToggle } from "./language-toggle"
import { ThemeToggle } from "../theme-toggle"

type MobileNavProps = {
  lang: Locale;
  visibleNavLinks: NavItem[];
  getLocalizedLink: (href: string, external?: boolean) => string;
  cta: NavItem | undefined;
  ctaLabel: string;
  ctaHref: string;
}

export function MobileNav({ lang, visibleNavLinks, getLocalizedLink, cta, ctaLabel, ctaHref }: MobileNavProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    return (
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full bg-background p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <Logo />
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>
                <nav className="mt-12 flex flex-col gap-6">
                  {visibleNavLinks.sort((a,b) => a.order - b.order).map((link) => (
                    <Link
                      key={link.id}
                      href={getLocalizedLink(link.href, link.type === 'external')}
                      target={link.target || '_self'}
                      rel={link.type === 'external' ? 'noopener noreferrer' : ''}
                      className="text-xl font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {lang === 'ro' ? link.label_ro : link.label_en}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-4">
                  {cta && (
                     <Button size="lg" asChild>
                        <Link href={ctaHref} onClick={() => setIsMobileMenuOpen(false)} target={cta.type === 'external' ? '_blank' : '_self'}>{ctaLabel}</Link>
                      </Button>
                  )}
                  <div className="flex justify-center gap-2">
                    <LanguageToggle lang={lang} />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
    )
}
