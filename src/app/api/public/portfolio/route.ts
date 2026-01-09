import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { Project } from '@/lib/types';
import type { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { db, info: adminInfo } = getAdminDb();
  
  console.log(`[API /public/portfolio] mode=${adminInfo.mode}`);

  if (!db) {
    return NextResponse.json({ ok: false, error: 'Server configuration error. Admin SDK not initialized.', debug: { adminMode: adminInfo.mode, adminError: adminInfo.error } }, { status: 500 });
  }
  
  try {
    const summariesRef = db.collection('project_summaries');
    let q: Query = summariesRef.where('isPublished', '==', true);
    q = q.orderBy('publishedAt', 'desc').limit(50);
    
    const snapshot = await q.get();

    const items: Project[] = snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      const media = (data.mediaIds || []).map((id: string) => PlaceHolderImages.find(p => p.id === id)).filter((i): i is ImagePlaceholder => !!i);

      return {
        ...data,
        id: doc.id,
        media: media,
        createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        publishedAt: data.publishedAt?.toDate?.().toISOString() || new Date().toISOString(),
      } as Project;
    });
    
    return NextResponse.json({ ok: true, items });

  } catch (error: any) {
    console.error(`[API /public/portfolio] Error during fetch:`, { code: error.code, message: error.message });
    return NextResponse.json({ ok: false, error: error.message, code: error.code, debug: { adminMode: adminInfo.mode } }, { status: 500 });
  }
}
