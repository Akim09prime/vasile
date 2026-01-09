
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { Project } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { findImage } from '@/lib/services/page-service';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function GET(request: Request, { params }: { params: { slug: string }}) {
  const { slug } = params;
  const { db, info: adminInfo } = getAdminDb();
  
  console.log(`[API /public/portfolio/detail] mode=${adminInfo.mode}, slug=${slug}`);

  if (!db) {
    return NextResponse.json({ ok: false, error: 'Server configuration error. Admin SDK not initialized.', debug: { adminMode: adminInfo.mode, adminError: adminInfo.error } }, { status: 500 });
  }
  
  try {
    const summariesRef = db.collection('project_summaries');

    // Query by slug first
    let snapshot = await summariesRef.where('slug', '==', slug).where('isPublished', '==', true).limit(1).get();
    
    let doc: QueryDocumentSnapshot | undefined = snapshot.docs[0];

    // If not found by slug, try to get by ID as a fallback
    if (!doc) {
      console.log(`[API /public/portfolio/detail] Slug '${slug}' not found. Trying as ID.`);
      const docById = await summariesRef.doc(slug).get();
      if (docById.exists && docById.data()?.isPublished) {
        // We have to cast because get() returns DocumentSnapshot without the methods of QueryDocumentSnapshot
        doc = docById as QueryDocumentSnapshot;
      }
    }

    if (!doc) {
      return NextResponse.json({ ok: false, error: 'Not Found' }, { status: 404 });
    }

    const data = doc.data();
    if (!data) {
       return NextResponse.json({ ok: false, error: 'Not Found' }, { status: 404 });
    }
    
    // --- Data Normalization ---
    const mediaIds = data.mediaIds || [];
    const resolvedMedia = mediaIds.map((id: string) => findImage(id)).filter(Boolean);
    const coverMedia = data.image || findImage(data.coverMediaId);


    const item: Project = {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        publishedAt: data.publishedAt?.toDate?.().toISOString() || new Date().toISOString(),
        // Keep original fields for backward compatibility
        mediaIds: mediaIds,
        // Add normalized fields for the UI
        media: resolvedMedia,
        image: coverMedia,
    } as Project;
    
    return NextResponse.json({ ok: true, item });

  } catch (error: any) {
    console.error(`[API /public/portfolio/detail] Error for slug '${slug}':`, { code: error.code, message: error.message });
    const debugInfo = {
        adminMode: adminInfo.mode,
        adminError: adminInfo.error,
        errorMessage: error.message,
        errorCode: error.code,
    };
    return NextResponse.json({ ok: false, error: 'Internal Server Error', debug: debugInfo }, { status: 500 });
  }
}

