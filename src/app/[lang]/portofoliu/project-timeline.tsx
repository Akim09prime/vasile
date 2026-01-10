
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Tag, ChevronsRight } from 'lucide-react';
import type { ProjectSummary, ProjectType } from '@/lib/types';
import type { Locale } from '@/lib/i18n-config';
import { cn } from '@/lib/utils';
import { stagger, fadeUp } from '@/lib/motion';

type ProjectTimelineProps = {
  initialProjects: ProjectSummary[];
  categories: ProjectType[];
  lang: Locale;
};

export function ProjectTimeline({
  initialProjects,
  categories,
  lang,
}: ProjectTimelineProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [filteredProjects, setFilteredProjects] = React.useState(initialProjects);

  React.useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredProjects(initialProjects);
    } else {
      setFilteredProjects(
        initialProjects.filter(
          (p) => p.categorySlug === activeCategory
        )
      );
    }
  }, [activeCategory, initialProjects]);

  const getTimelineDate = (project: ProjectSummary): Date | null => {
      const dateStr = project.completedAt || project.publishedAt || project.createdAt;
      return dateStr ? new Date(dateStr) : null;
  }

  const projectsByYear = filteredProjects.reduce((acc, project) => {
    const date = getTimelineDate(project);
    if (date) {
      const year = date.getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(project);
    }
    return acc;
  }, {} as Record<number, ProjectSummary[]>);

  const sortedYears = Object.keys(projectsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <>
      <div className="mb-12 flex flex-wrap justify-center gap-2">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'secondary'}
          onClick={() => setActiveCategory('all')}
        >
          Toate
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.slug ? 'default' : 'secondary'}
            onClick={() => setActiveCategory(cat.slug)}
          >
            {cat.label_ro}
          </Button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold">Niciun proiect găsit</h3>
          <p className="text-muted-foreground mt-2">
            Nu există proiecte publicate pentru categoria selectată.
          </p>
        </div>
      ) : (
        <motion.div
            className="relative"
            variants={stagger(0.1)}
            initial="hidden"
            animate="show"
        >
          <div
            className="absolute left-4 md:left-1/2 w-0.5 h-full bg-border -translate-x-1/2"
            aria-hidden="true"
          />
          {sortedYears.map((year, yearIndex) => (
            <React.Fragment key={year}>
              <motion.div
                variants={fadeUp}
                className="relative flex items-center justify-start md:justify-center mb-8"
              >
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary ring-8 ring-background z-10" />
                <h2 className="pl-12 md:pl-0 md:text-center text-2xl font-headline text-primary bg-background pr-4 relative z-10">
                  {year}
                </h2>
              </motion.div>

              {projectsByYear[year].map((project, projectIndex) => {
                  const projectDate = getTimelineDate(project);
                  return (
                    <motion.div
                      key={project.id}
                      variants={fadeUp}
                      className={cn(
                        'relative grid grid-cols-1 md:grid-cols-2 items-center gap-8 mb-16'
                      )}
                    >
                      <div
                        className={cn(
                          'relative z-10',
                          projectIndex % 2 === 0 ? 'md:order-1' : 'md:order-2 md:text-right'
                        )}
                      >
                        <div className="absolute left-4 md:left-auto md:right-full md:mr-4 top-1/2 w-2 h-2 rounded-full bg-border -translate-y-1/2" />
                          {projectIndex % 2 !== 0 && <div className="md:hidden absolute left-4 top-1/2 w-2 h-2 rounded-full bg-border -translate-y-1/2" />}
                          <div className="md:hidden absolute left-4 top-1/2 w-2 h-2 rounded-full bg-border -translate-y-1/2" />
                          {projectIndex % 2 === 0 && <div className="hidden md:block absolute left-full ml-4 top-1/2 w-2 h-2 rounded-full bg-border -translate-y-1/2" />}
                          {projectIndex % 2 !== 0 && <div className="hidden md:block absolute right-full mr-4 top-1/2 w-2 h-2 rounded-full bg-border -translate-y-1/2" />}
                        
                        <div className="pl-12 md:pl-0 md:p-8">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                {projectDate && (
                                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/>{projectDate.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric'})}</span>
                                )}
                                <span className="flex items-center gap-1.5"><Tag className="w-4 h-4"/>{project.category}</span>
                          </div>
                            <h3 className="h3-headline mb-4">{project.name}</h3>
                            <p className="text-muted-foreground mb-6">{project.summary}</p>
                            <Button asChild variant="link" className="p-0">
                                <Link href={`/${lang}/portofoliu/${project.slug || project.id}`}>Vezi Proiect <ChevronsRight className="w-4 h-4 ml-1"/></Link>
                            </Button>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'relative group',
                          projectIndex % 2 === 0 ? 'md:order-2' : 'md:order-1'
                        )}
                      >
                        <Link href={`/${lang}/portofoliu/${project.slug || project.id}`}>
                          {project.image ? (
                            <Image
                              src={project.image.imageUrl}
                              alt={project.image.description || ''}
                              width={600}
                              height={400}
                              className="rounded-lg object-cover w-full aspect-video transition-all duration-300 group-hover:shadow-cinematic-lift"
                            />
                          ) : (
                            <div className="w-full aspect-video bg-secondary rounded-lg" />
                          )}
                        </Link>
                      </div>
                    </motion.div>
                  )
              })}
            </React.Fragment>
          ))}
        </motion.div>
      )}
    </>
  );
}
