
'use client';

import Link from "next/link"
import React from "react"
import { usePathname, useParams } from 'next/navigation';
import { Logo } from "@/components/logo"
import type { Locale } from "@/lib/i18n-config"
import type { FooterSettings, FooterLink } from "@/lib/types";
import { subscribeFooter } from "@/lib/services/settings-service";
import { defaultFooter } from "@/lib/defaults";
import { Skeleton } from "../ui/skeleton";

export default function Footer() {
  const pathname = usePathname();
  const params = useParams();
  const lang = params.lang as Locale;
  
  const [footerData, setFooterData] = React.useState<FooterSettings>(defaultFooter);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = subscribeFooter((settings) => {
        setFooterData(settings);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdminPage = pathname.includes('/admin');
  if (isAdminPage) {
    return null;
  }

  const getLocalizedLink = (href: string) => {
    if (href.startsWith('http')) return href;
    if (href === '/') return `/${lang}`;
    return `/${lang}${href}`;
  }

  const renderLinks = (links: FooterLink[]) => (
     <ul className="space-y-3">
        {links.filter(l => l.enabled).sort((a,b) => a.order - b.order).map((link) => (
          <li key={link.id}>
            <Link 
              href={getLocalizedLink(link.href)} 
              className="text-foreground/70 hover:text-primary transition-colors"
            >
              {lang === 'ro' ? link.label_ro : link.label_en}
            </Link>
          </li>
        ))}
      </ul>
  )
  
  const { contact, socials, columns, bottomLinks } = footerData;
  const currentYear = new Date().getFullYear();
  const copyrightText = (lang === 'ro' ? `© ${currentYear} CARVELLO. Toate drepturile rezervate.` : `© ${currentYear} CARVELLO. All rights reserved.`);

  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container-max section-padding !py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <Logo />
            <div className="mt-4 text-foreground/70 max-w-sm space-y-2">
                {loading ? <Skeleton className="h-12 w-full"/> : 
                  <>
                    {contact.email && <p>{contact.email}</p>}
                    {contact.phone && <p>{contact.phone}</p>}
                    {lang === 'ro' ? contact.city_ro : contact.city_en}
                  </>
                }
            </div>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {loading ? <>
                <div className="space-y-4"><Skeleton className="h-5 w-24 mb-4"/><Skeleton className="h-4 w-32"/><Skeleton className="h-4 w-32"/></div>
                <div className="space-y-4"><Skeleton className="h-5 w-24 mb-4"/><Skeleton className="h-4 w-32"/><Skeleton className="h-4 w-32"/></div>
                <div className="space-y-4"><Skeleton className="h-5 w-24 mb-4"/><Skeleton className="h-4 w-32"/><Skeleton className="h-4 w-32"/></div>
            </> : 
            <>
                {columns.filter(c => c.enabled).sort((a,b) => a.order - b.order).map(col => (
                    <div key={col.id}>
                         <h4 className="font-semibold mb-4">{lang === 'ro' ? col.title_ro : col.title_en}</h4>
                         {renderLinks(col.links)}
                    </div>
                ))}

                <div>
                  <h4 className="font-semibold mb-4">Social</h4>
                  <ul className="space-y-3">
                    {socials.filter(item => item.enabled).sort((a,b) => a.order - b.order).map(item => (
                        <li key={item.id}><a href={item.href} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors">{item.label}</a></li>
                    ))}
                  </ul>
                </div>
            </>
            }
          </div>
        </div>
        <div className="mt-16 pt-8 border-t text-sm text-foreground/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>{copyrightText}</p>
          <div className="flex gap-4">
            {bottomLinks.filter(l => l.enabled).sort((a,b) => a.order - b.order).map(link => (
                <Link key={link.id} href={getLocalizedLink(link.href)} className="hover:text-primary transition-colors">
                    {lang === 'ro' ? link.label_ro : link.label_en}
                </Link>
            ))}
             <Link href="/admin/login" className="hover:text-primary transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
