
import * as React from 'react';
import { getPortfolioPageData } from '@/lib/services/page-service';
import { getProjectTypes } from '@/lib/services/settings-service';
import { PageHeader } from '@/components/layout/page-header';
import { Locale } from '@/lib/i18n-config';
import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getProjectsFromApi } from '@/lib/services/project-api-service';
import { ProjectTimeline } from './project-timeline';

async function loadPortfolioData() {
    try {
        // Fetch both categories and projects in parallel.
        const [categories, projects] = await Promise.all([
            getProjectTypes(),
            getProjectsFromApi(),
        ]);
        const activeCategories = categories.filter(c => c.active);
        return { categories: activeCategories, projects, error: null };
    } catch (error: any) {
        console.error('[PortfolioPage] Failed to load data:', error);
        return { categories: [], projects: [], error: error.message || 'A apărut o eroare la încărcarea datelor.' };
    }
}

export default async function PortfolioPage({ params }: { params: { lang: Locale }}) {
    const { lang } = params;
    const portfolioPageData = getPortfolioPageData();
    const { categories, projects, error } = await loadPortfolioData();

    if (!portfolioPageData) {
        return <p>Eroare: Nu s-au putut încărca datele paginii.</p>;
    }
    
    const { intro } = portfolioPageData;
    
    return (
        <>
            <PageHeader
                badge={intro.badge}
                title={intro.title}
                description={intro.description}
            />

            <section className="section-padding container-max">
                {error ? (
                     <Alert variant="destructive" className="max-w-xl mx-auto">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Eroare la încărcarea Portofoliului</AlertTitle>
                        <AlertDescription>
                            <p className="font-mono text-xs mb-4 break-all whitespace-pre-wrap">{error}</p>
                            <p className="text-sm mt-2">Acest lucru se poate întâmpla dacă un index compozit necesar în Firestore nu a fost creat sau dacă API-ul nu poate fi accesat.</p>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <ProjectTimeline
                        lang={lang}
                        initialProjects={projects}
                        categories={categories}
                    />
                )}
            </section>
        </>
    );
}
