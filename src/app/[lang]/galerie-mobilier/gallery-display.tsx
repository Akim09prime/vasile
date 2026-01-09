'use client';

import * as React from 'react';
import Image from 'next/image';
import { GalleryImage, Locale } from '@/lib/types';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

type GalleryDisplayProps = {
    initialImages: GalleryImage[];
    lang: Locale;
};

export default function GalleryDisplay({ initialImages, lang }: GalleryDisplayProps) {
    const [images] = React.useState(initialImages);
    const [lightboxOpen, setLightboxOpen] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState<GalleryImage | null>(null);

    const openLightbox = (image: GalleryImage) => {
        setSelectedImage(image);
        setLightboxOpen(true);
    };

    return (
        <>
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
                            alt={item.image.description || ''}
                            width={500}
                            height={500}
                            className="w-full h-auto object-cover"
                            data-ai-hint={item.image.imageHint}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <div className="text-white">
                                <p className="text-sm font-medium">{item.projectName}</p>
                                <p className="text-xs opacity-80">{item.image.description}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

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
                                    alt={selectedImage.image.description || ''}
                                    fill
                                    className="object-contain rounded-lg"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                                    <p className="font-bold">{selectedImage.projectName}</p>
                                    <p className="text-sm opacity-90">{selectedImage.image.description}</p>
                                    <Button asChild variant="secondary" size="sm" className="mt-2">
                                        <Link href={`/${lang}/portofoliu/${selectedImage.projectSlug || selectedImage.projectId}`}>
                                            Vezi Proiectul
                                        </Link>
                                    </Button>
                                </div>
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
