
// This file is for server-side API fetching functions that can be used in Server Components.
// It is intentionally separate from project-service.ts to avoid 'use client' conflicts.

import type { ProjectSummary } from '@/lib/types';

/**
 * Fetches published project summaries from the public API endpoint.
 * This function is designed to be called from Server Components.
 * @returns A promise that resolves to an array of project summaries.
 */
export async function getProjectsFromApi(): Promise<ProjectSummary[]> {
    const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/public/portfolio`;

    try {
        const res = await fetch(apiUrl, {
            next: { revalidate: 300 } // Revalidate every 5 minutes
        });

        if (!res.ok) {
            console.error(`[getProjectsFromApi] API request failed with status ${res.status}`);
            const errorBody = await res.text();
            console.error(`[getProjectsFromApi] Error body: ${errorBody}`);
            throw new Error(`Failed to fetch portfolio data. Status: ${res.status}`);
        }

        const data = await res.json();
        if (!data.ok) {
            throw new Error(data.error || 'API returned a non-ok response');
        }

        return data.items || [];
    } catch (error) {
        console.error('[getProjectsFromApi] An error occurred during fetch:', error);
        // Re-throwing the error to be caught by the nearest error boundary.
        throw error;
    }
}
