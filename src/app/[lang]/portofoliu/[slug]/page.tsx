
import { Locale } from "@/lib/i18n-config";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Tag, Terminal } from "lucide-react";
import Link from "next/link";
import { Metadata, ResolvingMetadata } from 'next';
import type { Project } from "@/lib/types";

type Props = {
  params: { slug: string, lang: Locale }
}

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // browser should use relative url
    return '';
  }
  if (process.env.VERCEL_URL) {
    // Vercel deployment
    return `https://${process.env.VERCEL_URL}`;
  }
  // development server
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? 3000;
  return `http://${host}:${port}`;
}


async function getProjectFromApi(slug: string): Promise<{ project: Project | null; response: Response; body?: any }> {
    try {
        const fetchUrl = `${getBaseUrl()}/api/public/portfolio/${slug}`;
        console.log(`[ProjectDetailsPage] Fetching project from: ${fetchUrl}`);
            
        const res = await fetch(fetchUrl, { cache: 'no-store' });

        const body = await res.json().catch(() => ({ error: 'Failed to parse JSON body' }));
        
        if (!res.ok) {
           if (res.status === 404) {
             notFound();
           }
           return { project: null, response: res, body };
        }
        
        if (body.ok) {
            return { project: body.item, response: res, body: body };
        } else {
             if (res.status === 404 || body.code === 'NOT_FOUND') {
                notFound();
            }
            return { project: null, response: res, body: body };
        }

    } catch (error) {
        console.error(`Fetch failed for project ${slug}:`, error);
        // This simulates a 500 server error response for the caller to handle
        const mockResponse = new Response(JSON.stringify({ error: 'Fetch failed' }), { status: 500 });
        return { project: null, response: mockResponse, body: { error: (error as Error).message } };
    }
}


export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug, lang } = params;
  const { project } = await getProjectFromApi(slug);

  if (!project) {
    return {
      title: lang === 'ro' ? 'Proiect Negăsit' : 'Project Not Found',
      description: lang === 'ro' ? 'Proiectul pe care îl căutați nu există.' : 'The project you are looking for does not exist.',
    }
  }
  
  const previousImages = (await parent).openGraph?.images || []

  return {
    title: `${project.name} | CARVELLO`,
    description: project.summary,
    openGraph: {
      title: project.name,
      description: project.summary,
      images: [
        project.image?.imageUrl || '',
        ...previousImages,
      ],
    },
  }
}

export default async function ProjectDetailsPage({ params }: { params: { slug: string, lang: Locale }}) {
    const { slug, lang } = params;
    const { project, response, body } = await getProjectFromApi(slug);

    if (!project) {
        return (
            <div className="container-max section-padding">
                <Card className="p-6">
                    <h1 className="h2-headline text-destructive">Project Not Found or API Error</h1>
                    <p className="mt-4">Could not fetch project details for identifier: <strong>{slug}</strong></p>
                    <div className="mt-4 p-4 bg-secondary rounded-md text-sm">
                        <h3 className="font-bold mb-2 flex items-center gap-2"><Terminal className="w-4 h-4"/>Debug Information (Dev Only)</h3>
                        <pre className="whitespace-pre-wrap break-all font-mono text-xs">
                           <p><strong>Status:</strong> {response.status} {response.statusText}</p>
                           <strong>API Response Body:</strong>
                           <div className="mt-2 p-2 border rounded bg-background/50">
                                {JSON.stringify(body, null, 2)}
                           </div>
                        </pre>
                    </div>
                </Card>
            </div>
        )
    }

    // Since we fetch from project_summaries, content is not available.
    // We will display the summary in its place for now.
    const contentHtml = project.content || `<p>${project.summary}</p>`;


    return (
        <>
            <section className="py-12 md:py-20 bg-secondary/30">
                <div className="container-max px-6">
                    {project.image && 
                        <div className="relative h-64 md:h-[450px] rounded-lg overflow-hidden mb-12">
                            <Image 
                                src={project.image.imageUrl}
                                alt={project.image.description || 'Project cover image'}
                                fill
                                sizes="100vw"
                                className="object-cover"
                                priority
                            />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                    }

                    <div className="max-w-4xl mx-auto text-center relative -mt-24 md:-mt-32 z-10 text-white">
                        <h1 className="h1-headline !text-4xl md:!text-5xl">{project.name}</h1>
                        <div className="flex justify-center flex-wrap gap-4 pt-4">
                            <Badge variant="secondary" className="text-sm flex items-center gap-1.5"><Tag className="w-3.5 h-3.5"/>{project.category}</Badge>
                            {project.location && <Badge variant="secondary" className="text-sm flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/>{project.location}</Badge>}
                            {project.publishedAt && <Badge variant="secondary" className="text-sm flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/>{new Date(project.publishedAt).getFullYear()}</Badge>}
                        </div>
                    </div>
                </div>
            </section>

             <section className="section-padding container-max">
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <div className="prose dark:prose-invert max-w-none text-lg">
                             {project.summary && <p className="lead !text-xl !text-foreground/80">{project.summary}</p>}
                            
                            <div dangerouslySetInnerHTML={{ __html: contentHtml }}/>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <Card className="p-6 space-y-4 sticky top-24">
                             <h3 className="h3-headline border-b pb-2">Detalii Proiect</h3>
                            
                             <div>
                                <p className="font-semibold text-sm">Categorie</p>
                                <p className="text-foreground/80">{project.category}</p>
                            </div>
                             <div>
                                <p className="font-semibold text-sm">Locație</p>
                                <p className="text-foreground/80">{project.location}</p>
                            </div>
                             {project.publishedAt && <div>
                                <p className="font-semibold text-sm">Dată Finalizare</p>
                                <p className="text-foreground/80">{new Date(project.publishedAt).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long' })}</p>
                            </div>}
                             <div className="pt-4">
                                <Button className="w-full" asChild>
                                    <Link href={`/${lang}/cerere-oferta`}>Cere o ofertă similară <ArrowRight /></Link>
                                </Button>
                             </div>
                        </Card>
                    </div>
                </div>
            </section>
            
            {project.media && project.media.length > 0 && (
                 <section className="bg-secondary/50 section-padding">
                    <div className="container-max">
                         <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="h2-headline">Galerie Proiect</h2>
                            <p className="mt-4 text-lg text-foreground/70">
                                Explorați detaliile și finisajele acestui proiect.
                            </p>
                        </div>
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                             {project.media.map(item => (
                                <div key={item.id} className="break-inside-avoid group relative">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.description}
                                        width={500}
                                        height={500}
                                        className="w-full h-auto rounded-lg object-cover"
                                        data-ai-hint={item.imageHint}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center p-4">
                                       <p className="text-white text-center text-sm">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    )
}
