
import { getPortfolioPageData } from '@/lib/services/page-service';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Locale } from '@/lib/i18n-config';
import ProjectTimeline from './project-timeline';
import { getPublicProjects } from '@/lib/services/project-api-service';

export const revalidate = 300; // Revalidate at most every 5 minutes

async function loadProjects() {
    try {
        const projects = await getPublicProjects();
        return { projects, error: null };
    } catch (error: any) {
        console.error('[PortfolioPage] Failed to load data:', error);
        return { projects: [], error: error.message || 'A apărut o eroare la încărcarea proiectelor.' };
    }
}

export default async function PortfolioPage({ params }: { params: { lang: Locale }}) {
    const { lang } = params;
    const { intro } = getPortfolioPageData();
    const { projects, error } = await loadProjects();
    
    return (
        <>
            <PageHeader
                badge={intro.badge}
                title={intro.title}
                description={intro.description}
            />

            <section className="section-padding container-max">
                {error ? (
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Eroare la încărcare</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <ProjectTimeline projects={projects} lang={lang} />
                )}
            </section>
        </>
    );
}
