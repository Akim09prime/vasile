

'use client';

import * as React from 'react';
import { Locale } from "@/lib/i18n-config";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Tag, Terminal, Loader } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { Gallery } from './gallery-client';

async function getProjectFromApi(slug: string): Promise<{ project: Project | null; error?: any }> {
    try {
        const fetchUrl = `/api/public/portfolio/${slug}`;
        console.log(`[ProjectDetailsPage] Fetching project from: ${fetchUrl}`);
            
        const res = await fetch(fetchUrl, { cache: 'no-store' });

        const body = await res.json();
        
        if (!res.ok) {
           return { project: null, error: { status: res.status, body: body } };
        }
        
        if (body.ok) {
            return { project: body.item, error: null };
        } else {
            return { project: null, error: { status: res.status, body: body } };
        }

    } catch (error) {
        console.error(`Fetch failed for project ${slug}:`, error);
        return { project: null, error: { status: 500, body: { error: (error as Error).message } } };
    }
}

export default function ProjectDetailsPage({ params }: { params: { slug: string, lang: Locale }}) {
    const { slug, lang } = params;
    const [project, setProject] = React.useState<Project | null>(null);
    const [error, setError] = React.useState<any | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function loadProject() {
            setLoading(true);
            const { project: fetchedProject, error: fetchError } = await getProjectFromApi(slug);
            setProject(fetchedProject);
            setError(fetchError);
            setLoading(false);

            if (fetchedProject) {
                document.title = `${fetchedProject.name} | CARVELLO`;
            }
        }
        loadProject();
    }, [slug]);

    if (loading) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Încărcare proiect...</p>
            </div>
        )
    }

    if (error || !project) {
        const is404 = error?.status === 404;
        return (
            <div className="container-max section-padding">
                <Card className="p-6 text-center">
                    <h1 className="h2-headline text-destructive">{is404 ? "Proiectul nu a fost găsit" : "Eroare la încărcare"}</h1>
                    <p className="mt-4">
                        {is404 
                            ? `Proiectul cu identificatorul "${slug}" nu există sau nu este publicat.`
                            : `A apărut o eroare la încărcarea detaliilor proiectului.`
                        }
                    </p>
                    <div className="mt-6">
                        <Button asChild>
                            <Link href={`/${lang}/portofoliu`}>Înapoi la Portofoliu</Link>
                        </Button>
                    </div>
                    {process.env.NODE_ENV === "development" && error && (
                        <div className="mt-6 p-4 bg-secondary rounded-md text-sm text-left">
                            <h3 className="font-bold mb-2 flex items-center gap-2"><Terminal className="w-4 h-4"/>Debug Information (Dev Only)</h3>
                            <pre className="whitespace-pre-wrap break-all font-mono text-xs">
                               <p><strong>Status:</strong> {error.status}</p>
                               <strong>API Response Body:</strong>
                               <div className="mt-2 p-2 border rounded bg-background/50">
                                    {JSON.stringify(error.body, null, 2)}
                               </div>
                            </pre>
                        </div>
                    )}
                </Card>
            </div>
        )
    }
    
    const contentHtml = project.content || `<p>${project.summary}</p>`;
    
    // SAFE DATE HANDLING: Check if date string is valid before creating a Date object.
    const rawDateString = project.completedAt || project.publishedAt;
    let completionDate: Date | null = null;
    if (rawDateString && !isNaN(new Date(rawDateString).getTime())) {
        completionDate = new Date(rawDateString);
    }


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
                            {completionDate && <Badge variant="secondary" className="text-sm flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/>{completionDate.getFullYear()}</Badge>}
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
                             {completionDate && <div>
                                <p className="font-semibold text-sm">Dată Finalizare</p>
                                <p className="text-foreground/80">{completionDate.toLocaleDateString('ro-RO', { year: 'numeric', month: 'long' })}</p>
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
            
            <Gallery project={project} lang={lang} />
        </>
    )
}
