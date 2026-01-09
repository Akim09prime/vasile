'use client';

import * as React from "react"
import type { Locale } from "@/lib/i18n-config"
import { HeaderContent } from './header-content';
import type { NavigationSettings } from "@/lib/types";
import { usePathname, useParams } from "next/navigation";
import { subscribeNavigation } from "@/lib/services/settings-service";
import { defaultNavigation } from "@/lib/defaults";

export default function Header() {
  const pathname = usePathname();
  const params = useParams();
  const lang = params.lang as Locale;
  
  const isAdminPage = pathname.includes('/admin');

  const [navSettings, setNavSettings] = React.useState<NavigationSettings>(defaultNavigation);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = subscribeNavigation((settings) => {
      setNavSettings(settings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isAdminPage || !lang) {
    return null;
  }

  return (
    <HeaderContent 
      lang={lang} 
      navSettings={navSettings}
      loading={loading}
    />
  )
}
