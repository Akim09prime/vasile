
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Locale } from '@/lib/i18n-config';
import { getPublicProjects } from '@/lib/services/project-api-service';
import { getPortfolioPageData } from '@/lib/services/page-service';
import { getProjectTypes } from '@/lib/services/settings-service';
import PortfolioClientLayout from './portfolio-client-layout';

export const revalidate = 300; // Revalidate at most every 5 minutes

async function loadData() {
    try {
        const [projects, categories] = await Promise.all([
            getPublicProjects(),
            getProjectTypes()
        ]);
        return { projects, categories, error: null };
    } catch (error: any) {
        console.error('[PortfolioPage] Failed to load data:', error);
        return { projects: [], categories: [], error: error.message || 'A apărut o eroare la încărcarea proiectelor.' };
    }
}

export default async function PortfolioPage({ params }: { params: { lang: Locale }}) {
    const { lang } = params;
    const { intro } = getPortfolioPageData();
    const { projects, categories, error } = await loadData();
    
    return (
        <>
            <PageHeader
                badge={intro.badge}
                title={intro.title}
                description={intro.description}
            />

            <section className="section-padding container-max">
                {error ? (
                    <Alert variant="destructive" className="max-w-2xl mx-auto">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Eroare la încărcare</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <PortfolioClientLayout 
                        initialProjects={projects} 
                        allCategories={categories}
                        lang={lang} 
                    />
                )}
            </section>
        </>
    );
}
