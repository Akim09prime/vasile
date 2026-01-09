
import 'server-only';
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { ProjectSummary } from '@/lib/types';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { getServerDb } from '@/lib/firebase-server-client';

// Revalidate this route every 5 minutes
export const revalidate = 300; 

export async function GET(request: Request) {
  try {
    const db = getServerDb();
    const summariesRef = collection(db, 'project_summaries');
    
    // Minimal Firestore query to avoid complex indexes.
    // This query requires a composite index on (isPublished: Asc, completedAt: Desc)
    const q = query(
        summariesRef, 
        where("isPublished", "==", true),
        orderBy("completedAt", "desc"),
        limit(200) // Safety limit
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return NextResponse.json({ ok: true, items: [] });
    }

    let projects = snapshot.docs.map(doc => {
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

    // In-code fallback sorting to ensure a stable, predictable order.
    // This avoids adding more orderBy clauses to the Firestore query.
    projects.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.publishedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.completedAt || b.publishedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
    });

    return NextResponse.json({ ok: true, items: projects });

  } catch (error: any) {
    console.error(`[API/public/portfolio] Firestore query failed:`, error);

    const isIndexError = error.code === 'failed-precondition';
    const errorMessage = isIndexError 
      ? `Query failed. A composite index is required in Firestore. Please create it. Details: ${error.message}`
      : `Failed to fetch public projects. Details: ${error.message}`;

    return NextResponse.json({
        ok: false,
        error: errorMessage,
        code: error.code || 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}
