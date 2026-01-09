import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { Project, ImagePlaceholder } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

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

    let snapshot = await projectsRef.where('slug', '==', slug).where('isPublished', '==', true).limit(1).get();
    
    let doc: QueryDocumentSnapshot | undefined = snapshot.docs[0];

    if (!doc) {
      console.log(`[API /public/portfolio/detail] Slug '${slug}' not found in 'projects'. Trying as ID.`);
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
    
    const media = (data.mediaIds || []).map((id: string) => PlaceHolderImages.find(p => p.id === id)).filter((i): i is ImagePlaceholder => !!i);
    const coverImage = PlaceHolderImages.find(p => p.id === data.coverMediaId);

    const item: Project = {
        ...data,
        id: doc.id,
        image: coverImage || null,
        media: media,
        createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        publishedAt: data.publishedAt?.toDate?.().toISOString() || new Date().toISOString(),
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
