

'use client'

import * as React from "react"
import Link from "next/link"

import type { NavigationSettings, NavItem } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from './language-toggle';
import { Logo } from "@/components/logo"
import type { Locale } from "@/lib/i18n-config"
import { MobileNav } from "./mobile-nav";
import { Skeleton } from "../ui/skeleton"

type HeaderContentProps = {
  lang: Locale;
  navSettings: NavigationSettings;
  loading: boolean;
}

export function HeaderContent({ lang, navSettings, loading }: HeaderContentProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  const getLocalizedLink = (href: string, external: boolean = false) => {
    if (external || href.startsWith('http')) return href;
    if (href === '/') return `/${lang}`;
    return `/${lang}${href}`;
  }

  const { items } = navSettings;
  
  const visibleNavLinks = items.filter(link => link.enabled && !link.isCta);
  const ctaItem = items.find(link => link.enabled && link.isCta);

  const ctaLabel = ctaItem ? (lang === 'ro' ? ctaItem.label_ro : ctaItem.label_en) : '';
  const ctaHref = ctaItem ? getLocalizedLink(ctaItem.href, ctaItem.type === 'external') : '#';


  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-background/65 shadow-cinematic-bloom backdrop-blur-lg border-b border-cinematic-border" : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="container-max flex h-20 items-center justify-between px-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          {loading ? (
            <>
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </>
          ) : (
             visibleNavLinks.sort((a,b) => a.order - b.order).map((link) => (
              <Link
                key={link.id}
                href={getLocalizedLink(link.href, link.type === 'external')}
                target={link.target || '_self'}
                rel={link.type === 'external' ? 'noopener noreferrer' : ''}
                className="text-sm font-medium text-muted transition-colors hover:text-gold-highlight"
              >
                {lang === 'ro' ? link.label_ro : link.label_en}
              </Link>
            ))
          )}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {loading ? (
            <Skeleton className="h-10 w-28" />
          ) : (
            ctaItem && (
                <Button asChild>
                  <Link href={ctaHref} target={ctaItem.type === 'external' ? '_blank' : '_self'}>{ctaLabel}</Link>
                </Button>
            )
          )}
          <LanguageToggle lang={lang} />
          <ThemeToggle />
        </div>
        <div className="md:hidden">
            <MobileNav 
              lang={lang} 
              visibleNavLinks={visibleNavLinks}
              getLocalizedLink={getLocalizedLink} 
              cta={ctaItem}
              ctaLabel={ctaLabel}
              ctaHref={ctaHref}
            />
        </div>
      </div>
    </header>
  )
}
