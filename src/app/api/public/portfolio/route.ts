
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { ProjectSummary } from '@/lib/types';
import type { Query } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// This API endpoint serves the public portfolio data.
// It's used by client-side components if needed, but Server Components can query Firestore directly.

export async function GET(request: Request) {
  const { db, info: adminInfo } = getAdminDb();
  
  if (!db) {
      return NextResponse.json({ ok: false, error: "Admin SDK not initialized.", code: "ADMIN_DB_FAIL" }, { status: 500 });
  }

  try {
    const summariesRef = db.collection('project_summaries');
    
    // This query requires a composite index.
    const q: Query = summariesRef
        .where('isPublished', '==', true)
        .orderBy('completedAt', 'desc')
        .orderBy('publishedAt', 'desc')
        .orderBy('createdAt', 'desc');

    const snapshot = await q.get();
    
    if (snapshot.empty) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const items: ProjectSummary[] = snapshot.docs.map(doc => {
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

    return NextResponse.json({ ok: true, items });

  } catch (error: any) {
    console.error('[API/public/portfolio] Firestore query failed:', error);
    if (error.code === 5) { // 'FAILED_PRECONDITION' for missing index in Admin SDK
         return NextResponse.json({ 
             ok: false, 
             error: "Firestore query failed. This is likely due to a missing composite index.",
             details: "Create an index on 'project_summaries' with fields: isPublished (asc), completedAt (desc), publishedAt (desc), createdAt (desc).",
             code: "MISSING_INDEX"
        }, { status: 500 });
    }
    return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
  }
}
