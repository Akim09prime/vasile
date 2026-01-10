
import { getHomePageData } from '@/lib/services/page-service';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/lib/i18n-config';
import HomePageContent from './home-page-content';


export default async function Home({
  params,
}: {
  params: { lang: Locale };
}) {
  const { lang } = params;
  
  // Fetch data on the server
  const dictionary = await getDictionary(lang);
  const homePageData = getHomePageData();
  
  if (!homePageData || !dictionary) {
    // This will be caught by the nearest error.tsx or returned as null
    return null;
  }

  // Pass server-fetched data as props to the Client Component
  return (
    <HomePageContent 
      lang={lang} 
      dictionary={dictionary}
      homePageData={homePageData}
    />
  );
}

