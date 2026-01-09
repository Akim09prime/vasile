import { getGalleryPageData } from '@/lib/services/page-service';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Locale } from '@/lib/i18n-config';
import { getGalleryImages } from '@/lib/services/project-api-service';
import GalleryDisplay from './gallery-display';

async function loadGalleryData() {
    try {
        const images = await getGalleryImages();
        return { images, error: null };
    } catch (error: any) {
        console.error('[GalleryPage] Failed to load data:', error);
        return { images: [], error: error.message || 'A apărut o eroare la încărcarea datelor.' };
    }
}

export default async function GalleryPage({ params }: { params: { lang: Locale }}) {
    const { lang } = params;
    const { intro } = getGalleryPageData();
    const { images, error } = await loadGalleryData();
    
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
                        <AlertTitle>Eroare la încărcare</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : images.length === 0 ? (
                    <div className="text-center py-16">
                        <h3 className="text-xl font-semibold">Nicio imagine de top</h3>
                        <p className="text-muted-foreground mt-2">Momentan nu există imagini marcate ca "Top". Reveniți mai târziu.</p>
                    </div>
                ) : (
                    <GalleryDisplay lang={lang} initialImages={images} />
                )}
            </section>
        </>
    );
}
