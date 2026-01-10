
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Project, ImagePlaceholder, Locale } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';


export function Gallery({ project, lang }: { project: Project, lang: Locale }) {
    const [lightboxOpen, setLightboxOpen] = React.useState(false);
    const [selected, setSelected] = React.useState(0);

    const mediaRaw = Array.isArray(project.media) ? project.media : [];
    const media = mediaRaw.filter((m): m is ImagePlaceholder => !!m && typeof m.imageUrl === 'string' && m.imageUrl.length > 0);
    
    if (media.length === 0) {
        return null;
    }

    const openLightbox = (index: number) => {
        setSelected(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => setLightboxOpen(false);

    const nextImage = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelected(prev => (prev + 1) % media.length);
    }, [media.length]);

    const prevImage = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelected(prev => (prev - 1 + media.length) % media.length);
    }, [media.length]);

    React.useEffect(() => {
        if (!lightboxOpen) return;
        const handleKeyDown = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape') closeLightbox();
            if (ev.key === 'ArrowRight') nextImage();
            if (ev.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, nextImage, prevImage]);

    const currentMedia = media[selected];
    if (!currentMedia) return null;

    return (
        <section className="py-14 md:py-20">
            <div className="container-max px-6">
                <div className="max-w-3xl mx-auto text-center mb-10">
                    <h2 className="h2-headline text-text">Galerie Proiect</h2>
                    <p className="mt-3 text-muted max-prose">Detalii, texturi și finisaje — prezentate cinematic.</p>
                </div>

                <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
                    <div className="relative rounded-2xl overflow-hidden border border-cinematic-border shadow-cinematic-bloom bg-surface">
                        <button type="button" onClick={() => openLightbox(selected)} className="group block w-full text-left" aria-label="Deschide în lightbox">
                            <div className="relative aspect-[16/10]">
                                <Image
                                    src={currentMedia.imageUrl}
                                    alt={currentMedia.description || project.name || "Imagine proiect"}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 900px"
                                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 pointer-events-none" />
                            </div>
                            <div className="p-4 md:p-5">
                                <p className="text-sm md:text-base text-text/90">{currentMedia.description || "Click pentru vizualizare"}</p>
                                <p className="mt-1 text-xs text-muted">{selected + 1} / {media.length}</p>
                            </div>
                        </button>

                        <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10">
                            <Button type="button" size="icon" variant="secondary" className="rounded-full h-10 w-10 backdrop-blur border border-cinematic-border shadow-cinematic-bloom" onClick={prevImage} aria-label="Imaginea anterioară">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10">
                            <Button type="button" size="icon" variant="secondary" className="rounded-full h-10 w-10 backdrop-blur border border-cinematic-border shadow-cinematic-bloom" onClick={nextImage} aria-label="Imaginea următoare">
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-cinematic-border bg-surface shadow-cinematic-bloom p-4">
                        <p className="text-sm text-muted mb-3">Cadre</p>
                        <div className="grid grid-cols-3 gap-3">
                            {media.slice(0, 12).map((m, idx) => {
                                const active = idx === selected;
                                return (
                                    <button
                                        type="button"
                                        key={m.id || m.imageUrl || idx}
                                        onClick={() => setSelected(idx)}
                                        className={cn(
                                            "relative overflow-hidden rounded-xl border transition-all",
                                            active ? "border-gold shadow-cinematic-bloom" : "border-cinematic-border hover:border-gold-highlight/60"
                                        )}
                                        aria-label={"Selectează imaginea " + (idx + 1)}
                                    >
                                        <div className="relative aspect-[4/3]">
                                            <Image src={m.imageUrl} alt={m.description || project.name || "Thumbnail"} fill sizes="200px" className="object-cover" />
                                        </div>
                                        {active && <div className="absolute inset-0 ring-1 ring-gold-highlight/60 pointer-events-none" />}
                                    </button>
                                );
                            })}
                        </div>
                        {media.length > 12 && <p className="mt-3 text-xs text-muted">+ {media.length - 12} imagini (în lightbox)</p>}
                    </div>
                </div>
            </div>

            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-0 shadow-none" onPointerDownOutside={closeLightbox}>
                    <div className="relative w-full rounded-2xl overflow-hidden border border-cinematic-border shadow-cinematic-lift bg-surface">
                        <div className="relative aspect-[16/10]">
                            <Image src={media[selected].imageUrl} alt={media[selected].description || project.name || "Imagine proiect"} fill className="object-contain bg-black/30" sizes="100vw" />
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                        </div>

                        <DialogClose asChild className="absolute right-3 top-3 z-50">
                            <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 backdrop-blur border border-cinematic-border shadow-cinematic-bloom">
                                <X className="h-5 w-5" />
                                <span className="sr-only">Inchide</span>
                            </Button>
                        </DialogClose>

                        <Button size="icon" variant="secondary" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full h-11 w-11 z-50 backdrop-blur border border-cinematic-border shadow-cinematic-bloom" onClick={prevImage} aria-label="Imaginea anterioară">
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button size="icon" variant="secondary" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-11 w-11 z-50 backdrop-blur border border-cinematic-border shadow-cinematic-bloom" onClick={nextImage} aria-label="Imaginea următoare">
                            <ChevronRight className="h-6 w-6" />
                        </Button>

                        <div className="px-5 py-4">
                            <p className="text-sm md:text-base text-text/90">{media[selected].description || ""}</p>
                            <p className="mt-1 text-xs text-muted">{selected + 1} / {media.length} • ESC închide • ← → navighează</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}
