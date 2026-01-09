'use client';

import * as React from 'react';
import Image from 'next/image';
import { getGalleryPageData } from '@/lib/services/page-service';
import { PageHeader } from '@/components/layout/page-header';
import type { GalleryImage, Project } from '@/lib/types';
import { Loader, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export default function GalleryPage() {
    const { intro } = getGalleryPageData();
    const [images, setImages] = React.useState<GalleryImage[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [lightboxOpen, setLightboxOpen] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState<GalleryImage | null>(null);

    React.useEffect(() => {
        const fetchTopRatedImages = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/public/portfolio', { cache: 'no-store' });
                if (!response.ok) throw new Error(`API error: ${response.statusText}`);
                
                const data = await response.json();
                if (!data.ok) throw new Error(data.error || 'Failed to fetch projects');

                const projects: Project[] = data.items;
                const topRatedProjects = projects.filter(p => p.rating === 5);
                
                const galleryImages: GalleryImage[] = topRatedProjects.flatMap(project =>
                    (project.media || []).map(img => ({
                        id: `${project.id}-${img.id}`,
                        projectId: project.id,
                        projectSlug: project.slug,
                        category: project.category || 'Uncategorized',
                        image: img,
                    }))
                );
                
                setImages(galleryImages);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTopRatedImages();
    }, []);

    const openLightbox = (image: GalleryImage) => {
        setSelectedImage(image);
        setLightboxOpen(true);
    };

    return (
        <>
            <PageHeader
                badge={intro.badge}
                title={intro.title}
                description={intro.description}
            />

            <section className="section-padding container-max">
                {loading ? (
                    <div className="flex justify-center items-center h-64 gap-2 text-muted-foreground">
                        <Loader className="animate-spin" />
                        <span>Se încarcă imaginile...</span>
                    </div>
                ) : error ? (
                    <Alert variant="destructive" className="max-w-xl mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Eroare la încărcare</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : images.length === 0 ? (
                    <div className="text-center py-16">
                        <h3 className="text-xl font-semibold">Nicio imagine de top</h3>
                        <p className="text-muted-foreground mt-2">Momentan nu există proiecte cotate cu 5 stele. Reveniți mai târziu.</p>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                         {images.map(item => (
                            <motion.div 
                                key={item.id} 
                                className="break-inside-avoid group relative rounded-lg overflow-hidden cursor-pointer"
                                onClick={() => openLightbox(item)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <Image
                                    src={item.image.imageUrl}
                                    alt={item.image.description}
                                    width={500}
                                    height={500}
                                    className="w-full h-auto object-cover"
                                    data-ai-hint={item.image.imageHint}
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                   <p className="text-white text-sm font-medium">{item.image?.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

             <AnimatePresence>
                {lightboxOpen && selectedImage && (
                    <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                        <DialogContent className="max-w-5xl w-full p-0 bg-transparent border-0 shadow-none">
                             <motion.div 
                                className="relative aspect-video"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <Image 
                                    src={selectedImage.image.imageUrl} 
                                    alt={selectedImage.image.description} 
                                    fill 
                                    className="object-contain rounded-lg"
                                />
                             </motion.div>
                            <DialogClose asChild>
                                <Button size="icon" variant="secondary" className="absolute -top-4 -right-4 rounded-full h-10 w-10 z-50">
                                    <X className="h-5 w-5" />
                                    <span className="sr-only">Închide</span>
                                </Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </>
    );
}
