
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { Project, ImagePlaceholder } from '@/lib/types';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function findImage(id?: string): ImagePlaceholder | undefined {
    if (!id) return undefined;
    const placeholder = PlaceHolderImages.find(p => p.id === id);
    if (!placeholder) return undefined;
    return placeholder;
}


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
    const projectsRef = db.collection('projects');

    // Query by slug first
    let snapshot = await projectsRef.where('slug', '==', slug).where('isPublished', '==', true).limit(1).get();
    
    let doc: QueryDocumentSnapshot | undefined = snapshot.docs[0];

    // If not found by slug, try to get by ID as a fallback
    if (!doc) {
      console.log(`[API /public/portfolio/detail] Slug '${slug}' not found. Trying as ID.`);
      const docById = await projectsRef.doc(slug).get();
      if (docById.exists && docById.data()?.isPublished) {
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
    
    const coverImage = findImage(data.coverMediaId);
    
    // Normalize media
    const media: ImagePlaceholder[] = (data.media || []).map((m: any) => {
        // If media is stored as full objects, use them. If just IDs, resolve them.
        if (typeof m === 'string') {
            return findImage(m);
        }
        return m;
    }).filter(Boolean);


    const item: Project = {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        publishedAt: data.publishedAt?.toDate?.().toISOString() || new Date().toISOString(),
        image: coverImage,
        media: media,
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
