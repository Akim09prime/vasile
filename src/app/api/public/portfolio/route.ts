

import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { getServerDb } from '@/lib/firebase-server-client';
import type { Project, ImagePlaceholder } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getServerDb();
  try {
    const q = query(
      collection(db, 'project_summaries'), 
      where('isPublished', '==', true),
      // We will sort on the client, as sorting by completedAt and filtering by isPublished requires a composite index
      // and client-side sorting is more flexible for fallback logic.
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      const completedAt = (data.completedAt as Timestamp)?.toDate()?.toISOString() ||
                          (data.publishedAt as Timestamp)?.toDate()?.toISOString() ||
                          (data.createdAt as Timestamp)?.toDate()?.toISOString();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        category: data.category,
        categorySlug: data.categorySlug,
        summary: data.summary,
        location: data.location,
        image: data.image,
        isPublished: data.isPublished,
        publishedAt: (data.publishedAt as Timestamp)?.toDate()?.toISOString() || null,
        completedAt: completedAt,
        createdAt: (data.createdAt as Timestamp)?.toDate()?.toISOString() || null,
        rating: data.rating || 0,
        media: data.media || [],
      } as Project;
    });

    // Sort items by date on the server before sending
    items.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.createdAt).getTime();
        const dateB = new Date(b.completedAt || b.createdAt).getTime();
        return dateB - dateA;
    });

    return NextResponse.json({ ok: true, items });

  } catch (error: any) {
    console.error('[API/public/portfolio] Error:', {
      message: error.message,
      code: error.code,
    });
    if (error.code === 'failed-precondition') {
        return NextResponse.json({ 
            ok: false, 
            error: 'Query requires a composite index. Please create it in your Firebase console.',
            details: error.message,
        }, { status: 500 });
    }
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch portfolio projects.', details: error.message },
      { status: 500 }
    );
  }
}
