

// This is a mock service to simulate fetching page data from a CMS or database.
// In a real application, this would be replaced with actual API calls to Firestore.
import { placeholderDb } from './deprecated-placeholder-db';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

// Helper to find an image by ID from the mock database
export function findImage(id?: string): ImagePlaceholder | undefined {
    if (!id) return undefined;
    return placeholderDb.images.find(p => p.id === id);
}

export function getHomePageData() {
    const data = placeholderDb.pages.home;
    return {
        ...data,
        hero: {
            ...data.hero,
            image: findImage(data.hero.imageId),
        },
        guarantees: {
            ...data.guarantees,
            image: findImage(data.guarantees.imageId),
        },
    };
}


export function getAboutPageData() {
    const data = placeholderDb.pages.about;
    return {
        ...data,
        images: {
            aboutImage1: findImage(data.images.aboutImage1Id),
            aboutImage2: findImage(data.images.aboutImage2Id),
        }
    };
}

export function getServicesPageData() {
    const data = placeholderDb.pages.services;
    const servicesWithImages = data.services.map(service => ({
        ...service,
        image: findImage(service.imageId)
    }));
    return {
        ...data,
        services: servicesWithImages,
    };
}

export function getPortfolioPageData() {
    return placeholderDb.pages.portfolio;
}

export function getGalleryPageData() {
    return placeholderDb.pages.gallery;
}

export type ContactPageData = {
    intro: {
        badge: string;
        title: string;
        description: string;
    };
    contactInfo: {
        title: string;
        email: string;
        phone: string;
        address: {
            line1: string;
            line2: string;
        };
    };
    program: {
        title: string;
        lines: string[];
    };
}

export function getContactPageData(): ContactPageData {
    return placeholderDb.pages.contact;
}
