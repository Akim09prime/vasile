
import { notFound } from 'next/navigation';
import { Locale } from "@/lib/i18n-config";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Tag } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { Gallery } from './gallery-client';
import { getProjectBySlug } from '@/lib/services/project-service';

async function getProject(slug: string): Promise<Project | null> {
    try {
        console.log(`[portfolio-detail] Fetching project with slug: ${slug}`);
        const project = await getProjectBySlug(slug);
        console.log(`[portfolio-detail] Found project: ${!!project}`);
        return project;
    } catch (e) {
        console.error(`Failed to fetch project with slug: ${slug}`, e);
        return null;
    }
}

export async function generateMetadata({ params }: { params: { slug: string }}) {
  const project = await getProject(params.slug);
  if (!project) {
    return {
      title: 'Proiect negăsit'
    }
  }
  return {
    title: `${project.name} | CARVELLO`,
    description: project.summary,
  }
}

export default async function ProjectDetailsPage({ params }: { params: { slug: string, lang: Locale }}) {
    const { slug, lang } = params;
    const project = await getProject(slug);

    if (!project) {
        notFound();
    }
    
    const contentHtml = project.content || `<p>${project.summary}</p>`;
    
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
