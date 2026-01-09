
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { Project, GalleryImage, ImagePlaceholder } from '@/lib/types';
import type { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { db, info: adminInfo } = getAdminDb();
  
  if (!db) {
    return NextResponse.json({ ok: false, error: 'Server configuration error. Admin SDK not initialized.', debug: { adminMode: adminInfo.mode, adminError: adminInfo.error } }, { status: 500 });
  }
  
  try {
    const summariesRef = db.collection('project_summaries');
    let q: Query = summariesRef.where('isPublished', '==', true);
    
    const snapshot = await q.get();
    
    if (snapshot.empty) {
        return NextResponse.json({ ok: true, items: [] });
    }

    const allTopImages: GalleryImage[] = [];

    snapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
        const projectData = doc.data() as Project;

        if (projectData.media && Array.isArray(projectData.media)) {
            projectData.media.forEach((mediaItem: ImagePlaceholder) => {
                if (mediaItem.isTop === true) {
                    allTopImages.push({
                        id: `${doc.id}-${mediaItem.id}`,
                        projectId: doc.id,
                        projectSlug: projectData.slug,
                        projectName: projectData.name,
                        category: projectData.category,
                        image: mediaItem,
                        publishedAt: projectData.publishedAt,
                    });
                }
            });
        }
    });

    // Sort images by project publication date, descending
    allTopImages.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
    });
    
    return NextResponse.json({ ok: true, items: allTopImages });

  } catch (error: any) {
    console.error(`[API /public/gallery] Error during fetch:`, { code: error.code, message: error.message });
    return NextResponse.json({ ok: false, error: error.message, code: error.code, debug: { adminMode: adminInfo.mode } }, { status: 500 });
  }
}
