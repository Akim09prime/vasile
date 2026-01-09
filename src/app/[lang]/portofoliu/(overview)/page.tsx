
'use client';

import * as React from 'react';
import Image from 'next/image';
import { getPortfolioPageData } from '@/lib/services/page-service';
import { getProjectTypes } from '@/lib/services/settings-service';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Locale } from '@/lib/i18n-config';
import { ArrowRight, Loader, Calendar, MapPin, Tag, Terminal } from 'lucide-react';
import { Project, ProjectType } from '@/lib/types';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ALL_CATEGORIES_ID = 'toate';

// This is the V1 component, stable and reads from the API.
function V1ProjectCard({ project, lang, index }: { project: Project; lang: Locale, index: number }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
           element.dataset.inview = 'true';
           observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const alignment = index % 2 === 0 ? 'lg:self-start' : 'lg:self-end';
  // Use slug if available and valid, otherwise fall back to id for robust linking
  const projectKey = (project.slug && project.slug.trim()) ? project.slug : project.id;
  const href = `/${lang}/portofoliu/${projectKey}`;
  const year = project.publishedAt ? new Date(project.publishedAt).getFullYear() : null;
  
  return (
    <div
      ref={ref}
      data-project-id={project.id}
      className={cn(
        'relative flex flex-col md:flex-row items-center gap-8 w-full max-w-4xl transition-all duration-1000 ease-in-out opacity-0 translate-y-10',
        'data-[inview=true]:opacity-100 data-[inview=true]:translate-y-0',
        alignment,
      )}
    >
      <div className={cn('relative w-full h-80 md:w-1/2 overflow-hidden rounded-lg group', index % 2 === 1 && 'md:order-2')}>
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
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No image</p>
          </div>
        )}
      </div>
      <div className={cn('md:w-1/2 space-y-4 text-center md:text-left', index % 2 === 1 && 'md:order-1')}>
        <h3 className="h3-headline">{project.name}</h3>
        <p className="text-muted-foreground">{project.summary}</p>
        <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-muted-foreground">
          {year && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{Number.isFinite(year) ? year : ''}</span>
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
        <Button asChild>
          <Link href={href}>
            {lang === 'ro' ? 'Vezi Detalii' : 'View Details'} <ArrowRight />
          </Link>
        </Button>
         {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-muted-foreground pt-2 font-mono">
                ID: {project.id} | Slug: {project.slug || 'N/A'}
            </div>
        )}
      </div>
    </div>
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
                if (process.env.NODE_ENV === 'development') {
                    console.log('--- DEBUG: API /api/public/portfolio response ---');
                    console.log('First item:', data.items?.[0]);
                    console.log('------------------------------------------------');
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

    // V1 Render Logic
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
                    <div className="relative flex flex-col items-center gap-16 md:gap-24">
                       <div className="absolute top-0 bottom-0 w-px bg-border left-1/2 -translate-x-1/2 hidden lg:block" aria-hidden="true" />
                        {filteredProjects.map((project, index) => (
                            <V1ProjectCard key={project.id} project={project} lang={lang} index={index} />
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
