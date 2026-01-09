
import 'server-only';

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { DocumentData } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLLECTION_NAME = 'project_summaries';

export async function GET(request: Request) {
  const { db, info: adminInfo } = getAdminDb();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API /public/portfolio] mode=${adminInfo.mode}`);
  }

  if (!db) {
    const errorPayload = {
      ok: false,
      error: 'Server configuration error. Admin SDK not initialized.',
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          adminMode: adminInfo.mode,
          adminError: adminInfo.error || 'No specific error message.',
        },
      }),
    };
    return NextResponse.json(errorPayload, { status: 500 });
  }

  try {
    const query = db.collection(COLLECTION_NAME)
      .where('isPublished', '==', true)
      .orderBy('publishedAt', 'desc')
      .limit(100);
      
    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const items: DocumentData[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        // Ensure timestamps are serializable
        publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate().toISOString() : null,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
      });
    });

    return NextResponse.json({ ok: true, items });

  } catch (error: any) {
    console.error(`[API /public/portfolio] Firestore query failed:`, error);
    const errorPayload = {
      ok: false,
      error: 'Failed to fetch portfolio data.',
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          adminMode: adminInfo.mode,
          errorMessage: error.message,
          errorCode: error.code,
        },
      }),
    };
    return NextResponse.json(errorPayload, { status: 500 });
  }
}
