// This file is for server-side API fetching functions that can be used in Server Components.
// It is intentionally separate from project-service.ts to avoid 'use client' conflicts.
import 'server-only';

import type { ProjectSummary } from '@/lib/types';
import { getServerDb } from '@/lib/firebase-server-client';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';


/**
 * Fetches published project summaries directly from Firestore using the server-side client SDK.
 * This function is designed for Server Components to avoid internal API calls.
 * @returns A promise that resolves to an array of project summaries.
 */
export async function getPublicProjects(): Promise<ProjectSummary[]> {
    try {
        const db = getServerDb();
        const summariesRef = collection(db, 'project_summaries');
        
        // This query requires a composite index: (isPublished: Asc, completedAt: Desc)
        const q = query(
            summariesRef, 
            where("isPublished", "==", true),
            orderBy("completedAt", "desc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return [];
        }

        const projects = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                slug: data.slug,
                category: data.category,
                categorySlug: data.categorySlug,
                summary: data.summary,
                location: data.location,
                isPublished: data.isPublished,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || null,
                completedAt: data.completedAt?.toDate?.().toISOString() || null,
                createdAt: data.createdAt?.toDate?.().toISOString() || null,
                image: data.image || null,
            } as ProjectSummary;
        });

        // Sort in code to handle fallbacks gracefully without complex indexes
        projects.sort((a, b) => {
            const dateA = new Date(a.completedAt || a.publishedAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.completedAt || b.publishedAt || b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        return projects;

    } catch (error: any) {
        console.error('[getPublicProjects] Firestore query failed:', error);

        if (error.code === 'failed-precondition') {
             throw new Error(`Firestore query failed. A composite index is likely required. Please create it in your Firebase console. Details: ${error.message}`);
        }
        
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
    const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/public/portfolio`;

    try {
        const res = await fetch(apiUrl, {
            next: { revalidate: 300 } // Revalidate every 5 minutes
        });

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
