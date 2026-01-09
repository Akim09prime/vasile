

import { placeholderDb as deprecatedDb } from './deprecated-placeholder-db';
import type { Project } from '@/lib/types';
import { findImage } from './page-service';

// This file is now primarily for seeding and providing a fallback structure.
// The actual default values are in /lib/defaults.ts

type ProjectPlaceholder = {
    id: string;
    name: string;
    category: string;
    summary: string;
    location: string;
    imageId: string;
    mediaIds: string[];
}

const projects: ProjectPlaceholder[] = [
    { id: 'proiect-bucatarie-moderna-stejar', name: 'Bucătărie modernă stejar', category: 'Bucătării', summary: 'Bucătărie spațioasă cu insulă, fronturi din MDF vopsit și blat din stejar masiv.', location: 'București', imageId: 'portfolio-1', mediaIds: ['portfolio-1', 'portfolio-4'] },
    { id: 'dressing-minimalist-oglinda', name: 'Dressing minimalist cu oglindă', category: 'Dressing-uri', summary: 'Dressing pe întregul perete cu uși glisante din oglindă fumurie și interior personalizat.', location: 'Cluj-Napoca', imageId: 'portfolio-2', mediaIds: ['portfolio-2'] },
    { id: 'living-media-unit-integrat', name: 'Mobilier living cu media unit', category: 'Living', summary: 'Ansamblu de living cu bibliotecă și media unit integrat, finisaj mat.', location: 'Timișoara', imageId: 'portfolio-3', mediaIds: ['portfolio-3'] },
    { id: 'proiect-biblioteca-custom', name: 'Bibliotecă custom cu iluminare', category: 'Living', summary: 'Bibliotecă de la podea la tavan cu scara mobilă și sistem de iluminare LED integrat.', location: 'Iași', imageId: 'portfolio-6', mediaIds: ['portfolio-6'] },
    { id: 'mobilier-baie-compact', name: 'Mobilier baie compact', category: 'Băi', summary: 'Set de mobilier compact pentru baie, cu lavoar încorporat și finisaj rezistent la umiditate.', location: 'Brașov', imageId: 'portfolio-5', mediaIds: ['portfolio-5'] },
    { id: 'birou-acasa-integrat', name: 'Birou pentru acasă integrat', category: 'Mobilier Birou', summary: 'Soluție completă pentru biroul de acasă, cu spații de depozitare inteligente și design ergonomic.', location: 'București', imageId: 'portfolio-8', mediaIds: ['portfolio-8'] },
];

export const placeholderDb = {
    projects: projects,
    galleryImages: deprecatedDb.galleryImages,
    pages: deprecatedDb.pages,
}

// Convert placeholder projects to the full Project type for seeding
export function getSeedProjects(): Omit<Project, 'id' | 'createdAt' | 'publishedAt'>[] {
    return projects.map(p => ({
        name: p.name,
        category: p.category,
        summary: p.summary,
        location: p.location,
        coverMediaId: p.imageId,
        mediaIds: p.mediaIds,
        isPublished: true,
        content: `
            <h3>Descrierea Proiectului</h3>
            <p>${p.summary} Un proiect de referință care demonstrează capacitatea noastră de a combina estetica modernă cu funcționalitatea, folosind materiale de cea mai înaltă calitate și tehnologie de prelucrare CNC.</p>
            <p>Am colaborat îndeaproape cu clientul pentru a ne asigura că fiecare detaliu corespunde viziunii sale, de la alegerea nuanțelor până la soluțiile de compartimentare interioară. Rezultatul este un spațiu armonios și perfect optimizat.</p>
            <ul>
                <li>Materiale folosite: MDF vopsit mat, PAL melaminat, feronerie premium.</li>
                <li>Tehnologii: Debitatre și frezare CNC, vopsire în câmp electrostatic.</li>
                <li>Durata de execuție: 4 săptămâni.</li>
            </ul>
        `,
        image: findImage(p.imageId),
        media: p.mediaIds.map(id => findImage(id)).filter(Boolean) as any,
    }));
}
