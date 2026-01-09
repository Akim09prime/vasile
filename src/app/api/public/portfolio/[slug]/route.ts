
import 'server-only';

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { DocumentSnapshot } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLLECTION_NAME = 'project_summaries';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const { db, info: adminInfo } = getAdminDb();

  if (process.env.NODE_ENV === 'development') {
    console.log(`[API /public/portfolio/${slug}] mode=${adminInfo.mode}`);
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
  
  let docSnapshot: DocumentSnapshot | null = null;
  let foundBy: 'slug' | 'id' | 'none' = 'none';

  try {
    // 1. Try to find by slug
    const slugQuery = db.collection(COLLECTION_NAME).where('slug', '==', slug).limit(1);
    const slugSnapshot = await slugQuery.get();

    if (!slugSnapshot.empty) {
      docSnapshot = slugSnapshot.docs[0];
      foundBy = 'slug';
    } else {
      // 2. If not found by slug, try to find by ID as a fallback
      const idDocRef = db.collection(COLLECTION_NAME).doc(slug);
      const idSnapshot = await idDocRef.get();
      if (idSnapshot.exists) {
        docSnapshot = idSnapshot;
        foundBy = 'id';
      }
    }

    if (!docSnapshot || !docSnapshot.exists) {
      const errorPayload = {
        ok: false,
        error: 'Not found',
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            message: `Document not found in '${COLLECTION_NAME}' with slug or ID: '${slug}'`,
            attemptedIdentifier: slug,
            collectionUsed: COLLECTION_NAME
          }
        })
      };
      return NextResponse.json(errorPayload, { status: 404 });
    }

    const data = docSnapshot.data();
    if (!data) {
       return NextResponse.json({ ok: false, error: 'Document has no data' }, { status: 404 });
    }

    const item = {
      id: docSnapshot.id,
      ...data,
      publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate().toISOString() : null,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
    };
    
    return NextResponse.json({ ok: true, item, debug: { foundBy } });

  } catch (error: any) {
    console.error(`[API /public/portfolio/${slug}] Firestore query failed:`, error);
    const errorPayload = {
      ok: false,
      error: 'Failed to fetch project data.',
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

