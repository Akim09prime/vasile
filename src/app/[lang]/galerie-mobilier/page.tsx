
'use client';

import * as React from 'react';
import Image from 'next/image';
import { getGalleryPageData } from '@/lib/services/page-service';
import { getGalleryImages } from '@/lib/services/project-service';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import type { GalleryImage } from '@/lib/types';

const ALL_CATEGORIES = 'Toate';

export default function GalleryPage() {
    const { intro } = getGalleryPageData();
    const allImages: GalleryImage[] = getGalleryImages();

    const [filter, setFilter] = React.useState(ALL_CATEGORIES);

    const categories = [ALL_CATEGORIES, ...Array.from(new Set(allImages.map(p => p.category)))];
    
    const filteredImages = allImages.filter(image => 
        filter === ALL_CATEGORIES || image.category === filter
    );

    return (
        <>
            <PageHeader
                badge={intro.badge}
                title={intro.title}
                description={intro.description}
            />

            <section className="section-padding container-max">
                <div className="mb-12 flex justify-center">
                    <div className="flex flex-wrap gap-2">
                         {categories.map(category => (
                             <Button 
                                key={category}
                                variant={filter === category ? 'secondary' : 'ghost'} 
                                size="sm"
                                onClick={() => setFilter(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>
                
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                     {filteredImages.map(item => (
                        <div key={item.id} className="break-inside-avoid group relative">
                             {item.image && (
                                <Image
                                    src={item.image.imageUrl}
                                    alt={item.image.description}
                                    width={500}
                                    height={500}
                                    className="w-full h-auto rounded-lg object-cover"
                                    data-ai-hint={item.image.imageHint}
                                />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center p-4">
                               <p className="text-white text-center text-sm">{item.image?.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
