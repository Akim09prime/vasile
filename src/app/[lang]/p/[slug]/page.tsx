

// This is a placeholder for dynamic pages.
// In a real application, you would fetch content based on the slug.

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Locale } from '@/lib/i18n-config';

export default async function DynamicPage({ params }: { params: Promise<{ slug: string, lang: Locale }> }) {
    const { slug } = await params;
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <>
            <PageHeader
                badge="Informații"
                title={title}
                description={`Detalii despre ${title}.`}
            />
            <section className="section-padding container-max">
                <Card>
                    <CardHeader/>
                    <CardContent>
                         <div className="prose dark:prose-invert max-w-none">
                            <h2>Conținut în curs de adăugare</h2>
                            <p>
                                Această pagină este în curs de construcție. Conținutul pentru <strong>{title}</strong> va fi disponibil în curând.
                            </p>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, 
                                adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, 
                                euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. 
                                Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue.
                            </p>
                             <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, 
                                adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, 
                                euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </>
    );
}

// In a real app, you would generate static paths for your pages:
// export async function generateStaticParams() {
//   const pages = await getListOfPages();
//   return pages.map((page) => ({
//     slug: page.slug,
//   }));
// }
