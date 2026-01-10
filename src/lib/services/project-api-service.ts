
// This file is for server-side API fetching functions that can be used in Server Components.
// It is intentionally separate from project-service.ts to avoid 'use client' conflicts.
import 'server-only';

import type { Project, ProjectSummary, GalleryImage, ImagePlaceholder } from '@/lib/types';
import { getServerDb } from '@/lib/firebase-server-client';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { PlaceHolderImages } from '../placeholder-images';

/**
 * Maps a full Project object to a ProjectSummary object.
 */
function mapProjectToSummary(projectDoc: any): ProjectSummary {
    const data = projectDoc.data();
    const coverImage = PlaceHolderImages.find(p => p.id === data.coverMediaId);
    
    return {
        id: projectDoc.id,
        name: data.name,
        slug: data.slug,
        category: data.category,
        categorySlug: data.categorySlug,
        summary: data.summary,
        location: data.location,
        isPublished: data.isPublished,
        // Safely convert timestamps to ISO strings
        publishedAt: data.publishedAt?.toDate?.().toISOString() || null,
        completedAt: data.completedAt?.toDate?.().toISOString() || null,
        createdAt: data.createdAt?.toDate?.().toISOString() || null,
        image: coverImage || null,
    };
}

/**
 * Sorts an array of projects by completion date, with fallbacks.
 */
function sortProjectsByDate(projects: (ProjectSummary | Project | GalleryImage)[]): any[] {
    return projects.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.publishedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.completedAt || b.publishedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
    });
}

/**
 * Fetches published project summaries directly from Firestore using the server-side client SDK.
 * Implements a fallback mechanism to query the `projects` collection if `project_summaries` is empty or fails.
 * @returns A promise that resolves to an array of project summaries.
 */
export async function getPublicProjects(): Promise<ProjectSummary[]> {
    const db = getServerDb();
    const limitCount = 200;

    // --- Primary Source: project_summaries ---
    try {
        console.log("[getPublicProjects] Attempting to fetch from source: project_summaries");
        const summariesRef = collection(db, 'project_summaries');
        const q = query(
            summariesRef, 
            where("isPublished", "==", true),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            console.log(`[getPublicProjects] Source: project_summaries. Found ${snapshot.size} documents.`);
            const projects = snapshot.docs.map(mapProjectToSummary);
            return sortProjectsByDate(projects);
        }
        console.log("[getPublicProjects] project_summaries is empty. Proceeding to fallback.");
    } catch (error: any) {
        console.warn(`[getPublicProjects] Warning: Could not fetch from project_summaries (Code: ${error.code}). Proceeding to fallback.`, error.message);
    }

    // --- Fallback Source: projects ---
    try {
        console.log("[getPublicProjects] Attempting to fetch from fallback source: projects");
        const projectsRef = collection(db, 'projects');
        const q = query(
            projectsRef,
            where("isPublished", "==", true),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            console.log("[getPublicProjects] Fallback source 'projects' is also empty or has no published items.");
            return [];
        }

        console.log(`[getPublicProjects] Source: projects_fallback. Found ${snapshot.size} documents.`);
        const projects = snapshot.docs.map(mapProjectToSummary);
        return sortProjectsByDate(projects);

    } catch (error: any) {
        console.error('[getPublicProjects] FATAL: Fallback query on "projects" collection failed.', error);
        throw new Error(`Failed to fetch public projects from Firestore. Details: ${error.message}`);
    }
}


/**
 * Fetches all images marked as 'isTop' from all published projects.
 * @returns A promise that resolves to an array of gallery images.
 */
export async function getGalleryImages(): Promise<GalleryImage[]> {
    const db = getServerDb();
    const allGalleryImages: GalleryImage[] = [];

    try {
        console.log("[getGalleryImages] Attempting to fetch from source: projects");
        const projectsRef = collection(db, 'projects');
        const q = query(
            projectsRef,
            where("isPublished", "==", true)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("[getGalleryImages] No published projects found.");
            return [];
        }

        snapshot.forEach(doc => {
            const projectData = doc.data() as Project;
            if (projectData.media && Array.isArray(projectData.media)) {
                projectData.media.forEach(image => {
                    if (image.isTop) {
                        const fullImage = PlaceHolderImages.find(p_img => p_img.id === (image as any).id);
                        if (fullImage) {
                            allGalleryImages.push({
                                id: `${doc.id}-${image.id}`,
                                projectId: doc.id,
                                projectSlug: projectData.slug,
                                projectName: projectData.name,
                                category: projectData.category,
                                image: fullImage,
                                publishedAt: projectData.publishedAt,
                                createdAt: projectData.createdAt,
                                completedAt: projectData.completedAt,
                            });
                        }
                    }
                });
            }
        });
        
        console.log(`[getGalleryImages] Found ${allGalleryImages.length} top-rated images.`);
        // Sort images by project date
        return sortProjectsByDate(allGalleryImages);

    } catch (error: any) {
        console.error('[getGalleryImages] FATAL: Query on "projects" collection failed.', error);
        throw new Error(`Failed to fetch gallery images from Firestore. Details: ${error.message}`);
    }
}


/**
 * Fetches a single project by SLUG using the server-side client SDK.
 * This is the canonical function to be used by Server Components.
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
    const db = getServerDb();
    try {
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, where("slug", "==", slug), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log(`[ProjectApiService] No project found with slug: ${slug}`);
            return null;
        }

        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        
        const coverImage = PlaceHolderImages.find(p => p.id === data.coverMediaId);

        return {
            id: docSnap.id,
            name: data.name,
            slug: data.slug,
            category: data.category,
            categorySlug: data.categorySlug,
            summary: data.summary,
            content: data.content,
            location: data.location,
            isPublished: data.isPublished,
            publishedAt: data.publishedAt?.toDate?.().toISOString(),
            completedAt: data.completedAt?.toDate?.().toISOString(),
            createdAt: data.createdAt.toDate().toISOString(),
            coverMediaId: data.coverMediaId,
            media: data.media || [],
            image: coverImage || null,
        };
    } catch (error: any) {
        console.error(`[ProjectApiService] Error fetching project by slug ${slug} (server SDK):`, error);
        // Re-throwing the error to be handled by the caller (e.g., in a try/catch block or an error boundary)
        throw new Error(`Failed to fetch project ${slug}.`);
    }
}
