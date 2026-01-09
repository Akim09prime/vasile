
'use client';

import * as React from 'react';
import { Locale } from "@/lib/i18n-config";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Tag, Terminal, X, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// This function now runs on the client.
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

function Gallery({ project }: { project: Project }) {
    const [lightboxOpen, setLightboxOpen] = React.useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

    const galleryMedia = project.media && project.media.length > 0 ? project.media : [];
    if (galleryMedia.length === 0) return null;

    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => setLightboxOpen(false);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev + 1) % galleryMedia.length);
    };
    
    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev - 1 + galleryMedia.length) % galleryMedia.length);
    };

    return (
        <section className="bg-secondary/50 section-padding">
            <div className="container-max">
                 <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="h2-headline">Galerie Proiect</h2>
                    <p className="mt-4 text-lg text-foreground/70">
                        Explorați detaliile și finisajele acestui proiect.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                     {galleryMedia.map((item, index) => (
                        <div key={item.id} className="break-inside-avoid group relative cursor-pointer" onClick={() => openLightbox(index)}>
                            <Image
                                src={item.imageUrl}
                                alt={item.description}
                                width={500}
                                height={500}
                                className="w-full h-auto rounded-lg object-cover aspect-[4/3] transition-all group-hover:brightness-75"
                                data-ai-hint={item.imageHint}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center p-4">
                               <p className="text-white text-center text-sm">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-0" onPointerDownOutside={closeLightbox}>
                    <div className="relative aspect-[16/10]">
                        <Image
                            src={galleryMedia[selectedImageIndex].imageUrl}
                            alt={galleryMedia[selectedImageIndex].description}
                            fill
                            className="object-contain"
                        />
                         <DialogClose className="absolute right-2 top-2 z-50">
                            <Button size="icon" variant="secondary" className="rounded-full h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogClose>
                    </div>
                     <Button size="icon" variant="secondary" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-50" onClick={prevImage}><ChevronLeft/></Button>
                     <Button size="icon" variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-50" onClick={nextImage}><ChevronRight/></Button>

                    <div className="bg-background/80 backdrop-blur-lg p-4 text-center mt-2 rounded-b-lg">
                        <p className="text-white">{galleryMedia[selectedImageIndex].description}</p>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
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
    
    // Fallback if content is missing
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
            
            <Gallery project={project} />
        </>
    )
}
