import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { Project, ImagePlaceholder } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function findImage(id?: string): ImagePlaceholder | undefined {
    if (!id) return undefined;
    return PlaceHolderImages.find(p => p.id === id);
}

export async function GET(request: Request, { params }: { params: { slug: string }}) {
  const { slug } = params;
  const { db, info: adminInfo } = getAdminDb();
  
  console.log(`[API /public/portfolio/detail] mode=${adminInfo.mode}, slug=${slug}`);

  if (!db) {
    return NextResponse.json({ ok: false, error: 'Server configuration error. Admin SDK not initialized.', debug: { adminMode: adminInfo.mode, adminError: adminInfo.error } }, { status: 500 });
  }
  
  try {
    const summariesRef = db.collection('project_summaries');

    let docSnap: QueryDocumentSnapshot | null = null;

    // Query by slug first
    const slugQuery = await summariesRef.where('slug', '==', slug).where('isPublished', '==', true).limit(1).get();
    
    if (!slugQuery.empty) {
      docSnap = slugQuery.docs[0];
    } else {
      // If not found by slug, try to get by ID as a fallback
      console.log(`[API /public/portfolio/detail] Slug '${slug}' not found. Trying as ID.`);
      const docById = await summariesRef.doc(slug).get();
      if (docById.exists && docById.data()?.isPublished) {
        docSnap = docById as QueryDocumentSnapshot;
      }
    }

    if (!docSnap || !docSnap.exists) {
      return NextResponse.json({ ok: false, error: 'Not Found' }, { status: 404 });
    }

    const data = docSnap.data();
    if (!data) {
       return NextResponse.json({ ok: false, error: 'Not Found' }, { status: 404 });
    }

    const mediaIds: string[] = data.mediaIds || [];
    const resolvedMedia = mediaIds.map(findImage).filter((i): i is ImagePlaceholder => !!i);

    const item: Project = {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        publishedAt: data.publishedAt?.toDate?.().toISOString() || new Date().toISOString(),
        // The 'image' field (cover) should already be on the summary document.
        // We add the resolved 'media' array for the gallery.
        media: resolvedMedia,
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
