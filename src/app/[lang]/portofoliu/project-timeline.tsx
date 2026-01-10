
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import type { ProjectSummary, Locale } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function TimelineItem({ project, lang, isLeft }: { project: ProjectSummary; lang: Locale; isLeft: boolean }) {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    const slug = project.slug || project.id;
    const projectUrl = `/${lang}/portofoliu/${slug}`;
    const completionDate = project.completedAt || project.publishedAt;

    const variants = {
        hidden: { opacity: 0, x: isLeft ? -100 : 100 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="relative"
        >
            <div className="md:flex items-start">
                <div className={`md:w-1/2 ${isLeft ? 'md:pr-8' : 'md:pl-8 md:order-2'}`}>
                    <Card className="overflow-hidden group">
                        <Link href={projectUrl}>
                            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
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
                            </div>
                        </Link>
                        <CardHeader>
                            <CardTitle>{project.name}</CardTitle>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <Badge variant="secondary">{project.category}</Badge>
                                {project.location && <Badge variant="outline" className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/>{project.location}</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground line-clamp-3">{project.summary}</p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="secondary" className="w-full">
                                <Link href={projectUrl}>Vezi Proiectul <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                <div className={`md:w-1/2 flex justify-center md:justify-start ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0 h-full">
                        <div className="w-px h-full bg-border"></div>
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
                        {completionDate && (
                            <div className="absolute top-14 left-1/2 -translate-x-1/2 md:left-auto md:right-full md:mr-4 md:translate-x-0 md:top-8 w-max">
                                <div className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(completionDate).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long' })}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function ProjectTimeline({ projects, lang }: { projects: ProjectSummary[]; lang: Locale; }) {
    if (!projects || projects.length === 0) {
        return (
            <div className="text-center py-16">
                <h3 className="text-xl font-semibold">Niciun proiect publicat</h3>
                <p className="text-muted-foreground mt-2">Momentan nu există proiecte în portofoliu. Reveniți mai târziu.</p>
            </div>
        );
    }
    
    return (
        <div className="relative space-y-12">
            <AnimatePresence>
                {projects.map((project, index) => (
                    <TimelineItem key={project.id} project={project} lang={lang} isLeft={index % 2 === 0} />
                ))}
            </AnimatePresence>
        </div>
    );
}
