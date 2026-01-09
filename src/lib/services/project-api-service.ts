// This file is for server-side API fetching functions that can be used in Server Components.
// It is intentionally separate from project-service.ts to avoid 'use client' conflicts.
import 'server-only';

import type { Project, ProjectSummary } from '@/lib/types';
import { getServerDb } from '@/lib/firebase-server-client';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { PlaceHolderImages } from '../placeholder-images';

/**
 * Maps a full Project object to a ProjectSummary object.
 */
function mapProjectToSummary(projectDoc: Project): ProjectSummary {
    const coverImage = PlaceHolderImages.find(p => p.id === projectDoc.coverMediaId);
    return {
        id: projectDoc.id,
        name: projectDoc.name,
        slug: projectDoc.slug,
        category: projectDoc.category,
        categorySlug: projectDoc.categorySlug,
        summary: projectDoc.summary,
        location: projectDoc.location,
        isPublished: projectDoc.isPublished,
        publishedAt: projectDoc.publishedAt,
        completedAt: projectDoc.completedAt,
        createdAt: projectDoc.createdAt,
        image: coverImage || null,
    };
}

/**
 * Sorts an array of projects by completion date, with fallbacks.
 */
function sortProjectsByCompletionDate(projects: ProjectSummary[]): ProjectSummary[] {
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
            orderBy("completedAt", "desc"),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            console.log(`[getPublicProjects] Success! Found ${snapshot.size} documents in project_summaries.`);
            const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectSummary));
            return sortProjectsByCompletionDate(projects);
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

        console.log(`[getPublicProjects] Success! Found ${snapshot.size} documents in fallback source 'projects'.`);
        const projects = snapshot.docs.map(doc => {
            const data = doc.data();
            const project: Project = {
                id: doc.id,
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
                createdAt: data.createdAt?.toDate?.().toISOString(),
                coverMediaId: data.coverMediaId,
                media: data.media || [],
            };
            return mapProjectToSummary(project);
        });

        return sortProjectsByCompletionDate(projects);

    } catch (error: any) {
        console.error('[getPublicProjects] FATAL: Fallback query on "projects" collection failed.', error);
        throw new Error(`Failed to fetch public projects from Firestore. Details: ${error.message}`);
    }
}


/**
 * Fetches published project summaries from the public API endpoint.
 * This function is designed to be called from Server Components.
 * @returns A promise that resolves to an array of project summaries.
 */
export async function getProjectsFromApi(): Promise<ProjectSummary[]> {
    // Note: Using getPublicProjects() is preferred over this fetch-based approach in Server Components.
    const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/public/portfolio`;

    try {
        const res = await fetch(apiUrl, { cache: 'no-store' });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error(`[getProjectsFromApi] API request failed with status ${res.status}. Body: ${errorBody}`);
            throw new Error(`Failed to fetch portfolio data. Status: ${res.status}`);
        }

        const data = await res.json();
        if (!data.ok) {
            console.error(`[getProjectsFromApi] API returned a non-ok response:`, data.error);
            throw new Error(data.error || 'API returned a non-ok response');
        }

        return data.items || [];
    } catch (error) {
        console.error('[getProjectsFromApi] An error occurred during fetch:', error);
        // Re-throwing the error to be caught by the nearest error boundary.
        throw error;
    }
}
