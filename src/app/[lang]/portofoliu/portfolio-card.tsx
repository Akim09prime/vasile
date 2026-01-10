
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import type { ProjectSummary, Locale } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { hoverLift, fadeUp } from '@/lib/motion';

type PortfolioCardProps = {
    project: ProjectSummary;
    lang: Locale;
};

export function PortfolioCard({ project, lang }: PortfolioCardProps) {
    
    const projectUrl = `/${lang}/portofoliu/${project.slug}`;
    
    // SAFE DATE HANDLING
    const rawDateString = project.completedAt || project.publishedAt;
    let completionDate: Date | null = null;
    if (rawDateString && !isNaN(new Date(rawDateString).getTime())) {
        completionDate = new Date(rawDateString);
    }
    
    return (
        <motion.div variants={fadeUp} {...hoverLift}>
            <Link href={projectUrl} className="group block rounded-lg overflow-hidden border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative aspect-video bg-muted overflow-hidden">
                    {project.image ? (
                        <Image
                            src={project.image.imageUrl}
                            alt={project.image.description || `Imagine pentru ${project.name}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">Imagine indisponibilă</p>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge variant="secondary" className="absolute top-3 right-3">{project.category}</Badge>
                </div>
                <div className="p-6">
                    <h3 className="font-heading text-2xl font-medium truncate group-hover:text-primary transition-colors">{project.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                        {project.location && (
                            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/>{project.location}</div>
                        )}
                        {completionDate && (
                            <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/>{completionDate.getFullYear()}</div>
                        )}
                    </div>
                    <p className="mt-3 text-muted-foreground text-sm line-clamp-2 h-10">{project.summary}</p>
                    <div className="mt-4">
                        <Button variant="ghost" className="p-0 h-auto text-primary">
                            {lang === 'ro' ? 'Vezi Proiectul' : 'View Project'}
                            <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
