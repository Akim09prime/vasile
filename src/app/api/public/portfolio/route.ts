
import 'server-only';

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { ProjectSummary } from '@/lib/types';
import type { Timestamp } from 'firebase-admin/firestore';

function toISO(timestamp: Timestamp | undefined | null): string | null {
    if (!timestamp) return null;
    return timestamp.toDate().toISOString();
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const { db, info: adminInfo } = getAdminDb();

  if (!db) {
    console.error("[API/public/portfolio] Admin DB not initialized.");
    return NextResponse.json({ 
        ok: false, 
        error: "Firebase Admin DB is not initialized. Check server logs.", 
        code: "ADMIN_NOT_CONFIGURED",
        items: []
    }, { status: 500 });
  }

  try {
    const snapshot = await db
      .collection('project_summaries')
      .where('isPublished', '==', true)
      .limit(100)
      .get();
      
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
        image: data.image || null,
        publishedAt: toISO(data.publishedAt as Timestamp),
        completedAt: toISO(data.completedAt as Timestamp),
        createdAt: toISO(data.createdAt as Timestamp),
      };
    });

    items.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.publishedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.completedAt || b.publishedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
    });

    return NextResponse.json({ ok: true, items });

  } catch (e: any) {
    console.error("[API/public/portfolio] FATAL ERROR:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || String(e), code: e?.code || "INTERNAL_ERROR", items: [] },
      { status: 500 }
    );
  }
}
