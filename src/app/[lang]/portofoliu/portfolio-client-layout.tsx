
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import type { ProjectSummary, ProjectType, Locale } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { List, Search } from 'lucide-react';
import { PortfolioCard } from './portfolio-card';
import { stagger } from '@/lib/motion';

type PortfolioClientLayoutProps = {
    initialProjects: ProjectSummary[];
    allCategories: ProjectType[];
    lang: Locale;
};

type SortOption = 'completedAt_desc' | 'completedAt_asc' | 'name_asc';

export default function PortfolioClientLayout({ initialProjects, allCategories, lang }: PortfolioClientLayoutProps) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
    const [activeCategory, setActiveCategory] = React.useState('all');
    const [sortOrder, setSortOrder] = React.useState<SortOption>('completedAt_desc');
    
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm]);

    const filteredAndSortedProjects = React.useMemo(() => {
        let filtered = initialProjects;

        // Filter by category
        if (activeCategory !== 'all') {
            filtered = filtered.filter(p => p.categorySlug === activeCategory);
        }

        // Filter by search term (using debounced value)
        if (debouncedSearchTerm) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                (p.location && p.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
            );
        }

        // Sort
        return [...filtered].sort((a, b) => {
            switch (sortOrder) {
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'completedAt_asc':
                    return new Date(a.completedAt || a.createdAt || 0).getTime() - new Date(b.completedAt || b.createdAt || 0).getTime();
                case 'completedAt_desc':
                default:
                    return new Date(b.completedAt || b.createdAt || 0).getTime() - new Date(a.completedAt || a.createdAt || 0).getTime();
            }
        });
    }, [initialProjects, activeCategory, debouncedSearchTerm, sortOrder]);

    const activeCategories = allCategories.filter(c => c.active);

    return (
        <div>
            {/* Controls: Filters, Sort, Search */}
            <div className="mb-12 space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative w-full md:w-auto md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder={lang === 'ro' ? "Caută după titlu sau locație..." : "Search by title or location..."}
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex-shrink-0">
                        <Select onValueChange={(value) => setSortOrder(value as SortOption)} defaultValue={sortOrder}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={lang === 'ro' ? "Sortează după..." : "Sort by..."} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="completedAt_desc">{lang === 'ro' ? "Cele mai noi" : "Newest"}</SelectItem>
                                <SelectItem value="completedAt_asc">{lang === 'ro' ? "Cele mai vechi" : "Oldest"}</SelectItem>
                                <SelectItem value="name_asc">{lang === 'ro' ? "Nume (A-Z)" : "Name (A-Z)"}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant={activeCategory === 'all' ? 'default' : 'secondary'} size="sm" onClick={() => setActiveCategory('all')}>
                        <List className="mr-2 h-4 w-4" />
                        {lang === 'ro' ? "Toate" : "All"}
                    </Button>
                    {activeCategories.map(cat => (
                        <Button 
                            key={cat.id}
                            variant={activeCategory === cat.slug ? 'default' : 'secondary'} 
                            size="sm"
                            onClick={() => setActiveCategory(cat.slug)}
                        >
                            {lang === 'ro' ? cat.label_ro : cat.label_en}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filteredAndSortedProjects.length > 0 ? (
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    variants={stagger(0.1)}
                    initial="hidden"
                    animate="show"
                >
                    <AnimatePresence>
                        {filteredAndSortedProjects.map(project => (
                           <PortfolioCard key={project.id} project={project} lang={lang} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                 <div className="text-center py-16">
                    <h3 className="text-xl font-semibold">{lang === 'ro' ? "Niciun proiect găsit" : "No projects found"}</h3>
                    <p className="text-muted-foreground mt-2">{lang === 'ro' ? "Încercați să ajustați filtrele de căutare." : "Try adjusting your search filters."}</p>
                </div>
            )}
        </div>
    );
}
