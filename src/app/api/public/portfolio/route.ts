
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { Project, ImagePlaceholder } from '@/lib/types';
import type { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';


function findImage(id?: string): ImagePlaceholder | undefined {
    if (!id) return undefined;
    const placeholder = PlaceHolderImages.find(p => p.id === id);
    if (!placeholder) return undefined;
    return placeholder;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { db, info: adminInfo } = getAdminDb();
  
  console.log(`[API /public/portfolio] mode=${adminInfo.mode}`);

  if (!db) {
    return NextResponse.json({ ok: false, error: 'Server configuration error. Admin SDK not initialized.', debug: { adminMode: adminInfo.mode, adminError: adminInfo.error } }, { status: 500 });
  }
  
  try {
    // We now query the main `projects` collection
    const projectsRef = db.collection('projects');
    let q: Query = projectsRef.where('isPublished', '==', true);
    q = q.orderBy('publishedAt', 'desc').limit(50);
    
    const snapshot = await q.get();

    const items: Project[] = snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      
      const coverImage = findImage(data.coverMediaId);
       // Normalize media
        const media: ImagePlaceholder[] = (data.media || []).map((m: any) => {
            if (typeof m === 'string') {
                return findImage(m);
            }
            return m;
        }).filter(Boolean);

      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        publishedAt: data.publishedAt?.toDate?.().toISOString() || new Date().toISOString(),
        image: coverImage,
        media: media,
      } as Project;
    });
    
    return NextResponse.json({ ok: true, items });

  } catch (error: any) {
    console.error(`[API /public/portfolio] Error during fetch:`, { code: error.code, message: error.message });
    return NextResponse.json({ ok: false, error: error.message, code: error.code, debug: { adminMode: adminInfo.mode } }, { status: 500 });
  }
}
