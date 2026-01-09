
'use client';

import * as React from 'react';
import Image from 'next/image';
import { getPortfolioPageData } from '@/lib/services/page-service';
import { getProjectTypes } from '@/lib/services/settings-service';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Locale } from '@/lib/i18n-config';
import { ArrowRight, Loader, Calendar, MapPin, Tag, Terminal, ChevronsRight } from 'lucide-react';
import { Project, ProjectType } from '@/lib/types';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';

const ALL_CATEGORIES_ID = 'toate';

function TimelineCard({ project, lang, index }: { project: Project; lang: Locale, index: number }) {
  const alignment = index % 2 === 0 ? 'lg:self-start' : 'lg:self-end';
  const projectKey = (project.slug && project.slug.trim()) ? project.slug : project.id;
  const href = `/${lang}/portofoliu/${projectKey}`;
  
  const dateToUse = project.completedAt || project.publishedAt || project.createdAt;
  const year = dateToUse ? new Date(dateToUse).getFullYear() : null;
  const fullDate = dateToUse ? new Date(dateToUse).toLocaleDateString(lang, { month: 'long', year: 'numeric' }) : null;

  return (
    <motion.div
      data-project-id={project.id}
      className={cn(
        'relative flex w-full max-w-4xl flex-col items-center gap-6 md:flex-row',
        alignment
      )}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
        {/* Date on the timeline */}
        <div className={cn(
            "absolute top-0 z-10 hidden items-center gap-4 lg:flex",
            index % 2 === 0 ? 'left-1/2 flex-row-reverse -translate-x-[calc(100%_+_2.5rem)]' : 'left-1/2 flex-row translate-x-[2.5rem]'
        )}>
            <div className="h-px w-10 bg-border"></div>
            {fullDate && <span className="text-sm font-semibold text-muted-foreground">{fullDate}</span>}
        </div>

      {/* Content Card */}
      <div className={cn("relative flex w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm md:flex-row", index % 2 === 1 && 'md:order-2')}>
        <div className={cn('relative w-full shrink-0 md:w-1/2 group h-80')}>
          {project.image ? (
            <Image
              src={project.image.imageUrl}
              alt={project.image.description || ''}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              data-ai-hint={project.image.imageHint}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <p className="text-sm text-muted-foreground">No image</p>
            </div>
          )}
        </div>
        <div className="flex flex-col p-6">
            <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {year && (
                    <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{year}</span>
                    </div>
                )}
                {project.location && (
                    <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                    </div>
                )}
                <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    <span>{project.category}</span>
                </div>
            </div>
          <h3 className="h3-headline">{project.name}</h3>
          <p className="mt-2 text-muted-foreground flex-grow">{project.summary}</p>
          <Button asChild className="mt-4 self-start">
            <Link href={href}>
              {lang === 'ro' ? 'Vezi Detalii' : 'View Details'} <ChevronsRight />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function PortfolioPage() {
    const params = useParams();
    const lang = params.lang as Locale;
    
    const [categories, setCategories] = React.useState<ProjectType[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>(ALL_CATEGORIES_ID);
    
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [retryTick, setRetryTick] = React.useState(0);
    
    const portfolioPageData = getPortfolioPageData();
    
    React.useEffect(() => {
        const loadCategoriesOnce = async () => {
            try {
                const fetchedCategories = await getProjectTypes();
                const activeCategories = fetchedCategories.filter(c => c.active);
                setCategories(activeCategories);
            } catch (e: any) {
                 const errorMessage = typeof e?.message === 'string' ? e.message : 'Nu s-au putut încărca categoriile de proiecte.';
                 setError(prev => prev === errorMessage ? prev : errorMessage);
            }
        };
        void loadCategoriesOnce();
    }, []);

    React.useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/public/portfolio', { cache: 'no-store' });
                if (!response.ok) {
                    let errorBody = 'Could not read error body.';
                    try {
                        errorBody = await response.text();
                    } catch {}
                    throw new Error(`API responded with ${response.status}: ${errorBody}`);
                }
                const data = await response.json();
                if (!data.ok) {
                    throw new Error(data.error || 'API returned an error');
                }
                setProjects(data.items);
            } catch (error: any) {
                const msg = typeof error?.message === 'string' ? error.message : String(error);
                setError(`A apărut o problemă la încărcarea proiectelor. Detalii: ${msg}`);
            } finally {
                setLoading(false);
            }
        };
        void fetchProjects();
    }, [lang, retryTick]);
    
    const handleFilterChange = (category: ProjectType | null) => {
        setSelectedCategoryId(category?.slug || ALL_CATEGORIES_ID);
    };

    if (!portfolioPageData) return null;
    
    const { intro } = portfolioPageData;
    const categoryLabel = (cat: ProjectType) => lang === 'ro' ? cat.label_ro : cat.label_en;
    const allCategoriesLabel = lang === 'ro' ? 'Toate' : 'All';

    const handleRetry = () => {
        setError(null);
        setRetryTick(t => t + 1);
    }
    
    const filteredProjects = projects.filter(p => 
        selectedCategoryId === ALL_CATEGORIES_ID || p.categorySlug === selectedCategoryId
    );

    return (
        <>
            <PageHeader
                badge={intro.badge}
                title={intro.title}
                description={intro.description}
            />

            <section className="section-padding container-max">
                 <div className="sticky top-[80px] z-40 bg-background/80 backdrop-blur-lg -mx-6 -mt-4 mb-16 py-4 flex justify-center shadow-sm">
                    <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-secondary/50">
                        <Button
                            key={ALL_CATEGORIES_ID}
                            variant={selectedCategoryId === ALL_CATEGORIES_ID ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => handleFilterChange(null)}
                        >
                            {allCategoriesLabel}
                        </Button>
                        {categories.map(category => (
                            <Button 
                               key={category.id}
                               variant={selectedCategoryId === category.slug ? 'secondary' : 'ghost'} 
                               size="sm"
                               onClick={() => handleFilterChange(category)}
                           >
                               {categoryLabel(category)}
                           </Button>
                       ))}
                    </div>
                </div>
                
                 {loading ? (
                    <div className="text-center flex items-center justify-center gap-2 h-64">
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>{lang === 'ro' ? 'Se încarcă proiectele...' : 'Loading projects...'}</span>
                    </div>
                 ) : error ? (
                    <Alert variant="destructive" className="max-w-xl mx-auto">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Eroare la încărcarea Portofoliului</AlertTitle>
                        <AlertDescription>
                            <p className="font-mono text-xs mb-4 break-all whitespace-pre-wrap">{error}</p>
                            <Button onClick={handleRetry} variant="secondary" className="mt-4">
                                Reîncearcă
                            </Button>
                        </AlertDescription>
                    </Alert>
                 ) : filteredProjects.length > 0 ? (
                    <div className="relative flex flex-col items-center gap-12 md:gap-16">
                       <div className="absolute top-0 bottom-0 w-px bg-border left-1/2 -translate-x-1/2 hidden lg:block" aria-hidden="true" />
                        {filteredProjects.map((project, index) => (
                            <TimelineCard key={project.id} project={project} lang={lang} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <p>{lang === 'ro' ? 'Niciun proiect găsit pentru această categorie.' : 'No projects found for this category.'}</p>
                    </div>
                )}
            </section>
        </>
    );
}
