
'use client';

import * as React from 'react';
import { Locale } from "@/lib/i18n-config";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Tag, Terminal, X, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import Link from "next/link";
import type { Project, ImagePlaceholder } from "@/lib/types";
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

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

function Gallery({ project }: { project: Project }) {\n  const [lightboxOpen, setLightboxOpen] = React.useState(false);\n  const [selected, setSelected] = React.useState(0);\n\n  const mediaRaw = Array.isArray(project.media) ? project.media : [];\n  const media = mediaRaw.filter((m: any) => m && typeof m.imageUrl === "string" && m.imageUrl.length > 0);\n  if (media.length === 0) return null;\n\n  const open = (index: number) => { setSelected(index); setLightboxOpen(true); };\n  const close = () => setLightboxOpen(false);\n  const next = (e?: any) => { if (e?.stopPropagation) e.stopPropagation(); setSelected((p) => (p + 1) % media.length); };\n  const prev = (e?: any) => { if (e?.stopPropagation) e.stopPropagation(); setSelected((p) => (p - 1 + media.length) % media.length); };\n\n  React.useEffect(() => {\n    if (!lightboxOpen) return;\n    const onKey = (ev: KeyboardEvent) => {\n      if (ev.key === "Escape") close();\n      if (ev.key === "ArrowRight") next();\n      if (ev.key === "ArrowLeft") prev();\n    };\n    window.addEventListener("keydown", onKey);\n    return () => window.removeEventListener("keydown", onKey);\n  }, [lightboxOpen, media.length]);\n\n  const current = media[selected];\n\n  return (\n    <section className="py-14 md:py-20">\n      <div className="container-max px-6">\n        <div className="max-w-3xl mx-auto text-center mb-10">\n          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-cinematic-text">Galerie Proiect</h2>\n          <p className="mt-3 text-cinematic-muted">Detalii, texturi si finisaje — prezentate cinematic.</p>\n        </div>\n\n        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">\n          <div className="relative rounded-2xl overflow-hidden border border-cinematic-border shadow-cinematic-bloom bg-cinematic-surface">\n            <button type="button" onClick={() => open(selected)} className="group block w-full text-left" aria-label="Deschide in lightbox">\n              <div className="relative aspect-[16/10]">\n                <Image\n                  src={current.imageUrl}\n                  alt={current.description || project.name || "Imagine proiect"}\n                  fill\n                  sizes="(max-width: 1024px) 100vw, 900px"\n                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"\n                  priority\n                />\n                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 pointer-events-none" />\n              </div>\n              <div className="p-4 md:p-5">\n                <p className="text-sm md:text-base text-cinematic-text/90">{current.description || "Click pentru vizualizare"}</p>\n                <p className="mt-1 text-xs text-cinematic-muted">{selected + 1} / {media.length}</p>\n              </div>\n            </button>\n\n            <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10">\n              <Button type="button" size="icon" variant="secondary" className="rounded-full h-10 w-10 backdrop-blur border border-cinematic-border shadow-cinematic-bloom" onClick={prev} aria-label="Imagine anterioara">\n                <ChevronLeft className="h-5 w-5" />\n              </Button>\n            </div>\n            <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10">\n              <Button type="button" size="icon" variant="secondary" className="rounded-full h-10 w-10 backdrop-blur border border-cinematic-border shadow-cinematic-bloom" onClick={next} aria-label="Imagine urmatoare">\n                <ChevronRight className="h-5 w-5" />\n              </Button>\n            </div>\n          </div>\n\n          <div className="rounded-2xl border border-cinematic-border bg-cinematic-surface shadow-cinematic-bloom p-4">\n            <p className="text-sm text-cinematic-muted mb-3">Cadre</p>\n            <div className="grid grid-cols-3 gap-3">\n              {media.slice(0, 12).map((m: any, idx: number) => {\n                const active = idx === selected;\n                return (\n                  <button\n                    type="button"\n                    key={m.id || m.imageUrl || idx}\n                    onClick={() => setSelected(idx)}\n                    className={cn(\n                      "relative overflow-hidden rounded-xl border transition-all",\n                      active ? "border-cinematic-gold shadow-cinematic-bloom" : "border-cinematic-border hover:border-cinematic-gold/60"\n                    )}\n                    aria-label={"Selecteaza imaginea " + (idx + 1)}\n                  >\n                    <div className="relative aspect-[4/3]">\n                      <Image src={m.imageUrl} alt={m.description || project.name || "Thumbnail"} fill sizes="200px" className="object-cover" />\n                    </div>\n                    {active && <div className="absolute inset-0 ring-1 ring-cinematic-gold/60 pointer-events-none" />}\n                  </button>\n                );\n              })}\n            </div>\n            {media.length > 12 && <p className="mt-3 text-xs text-cinematic-muted">+ {media.length - 12} imagini (in lightbox)</p>}\n          </div>\n        </div>\n      </div>\n\n      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>\n        <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-0 shadow-none" onPointerDownOutside={close}>\n          <div className="relative w-full rounded-2xl overflow-hidden border border-cinematic-border shadow-cinematic-lift bg-cinematic-surface">\n            <div className="relative aspect-[16/10]">\n              <Image src={media[selected].imageUrl} alt={media[selected].description || project.name || "Imagine proiect"} fill className="object-contain bg-black/30" sizes="100vw" />\n              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/10" />\n            </div>\n\n            <DialogClose className="absolute right-3 top-3 z-50">\n              <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 backdrop-blur border border-cinematic-border shadow-cinematic-bloom">\n                <X className="h-5 w-5" />\n              </Button>\n            </DialogClose>\n\n            <Button size="icon" variant="secondary" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full h-11 w-11 z-50 backdrop-blur border border-cinematic-border shadow-cinematic-bloom" onClick={prev} aria-label="Imagine anterioara">\n              <ChevronLeft className="h-6 w-6" />\n            </Button>\n            <Button size="icon" variant="secondary" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-11 w-11 z-50 backdrop-blur border border-cinematic-border shadow-cinematic-bloom" onClick={next} aria-label="Imagine urmatoare">\n              <ChevronRight className="h-6 w-6" />\n            </Button>\n\n            <div className="px-5 py-4">\n              <p className="text-sm md:text-base text-cinematic-text/90">{media[selected].description || ""}</p>\n              <p className="mt-1 text-xs text-cinematic-muted">{selected + 1} / {media.length} • ESC inchide • ← → navigheaza</p>\n            </div>\n          </div>\n        </DialogContent>\n      </Dialog>\n    </section>\n  );\n}\nexport default function ProjectDetailsPage({ params }: { params: { slug: string, lang: Locale }}) {
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
