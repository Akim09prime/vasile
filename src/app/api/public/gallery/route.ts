
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { Project, GalleryImage } from '@/lib/types';
import type { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { db, info: adminInfo } = getAdminDb();
  
  if (!db) {
    return NextResponse.json({ ok: false, error: 'Server configuration error. Admin SDK not initialized.', debug: { adminMode: adminInfo.mode, adminError: adminInfo.error } }, { status: 500 });
  }
  
  try {
    const projectsRef = db.collection('project_summaries');
    const q = projectsRef.where('isPublished', '==', true);
    
    const snapshot = await q.get();

    if (snapshot.empty) {
        return NextResponse.json({ ok: true, items: [] });
    }

    const allTopImages: GalleryImage[] = [];

    snapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
      const project = doc.data() as Project;
      
      if (project.media && Array.isArray(project.media)) {
        project.media.forEach(image => {
          // A top image is one that is explicitly marked as `isTop` or has a rating of 5.
          const isTopImage = image.isTop === true || image.rating === 5;

          if (isTopImage) {
            allTopImages.push({
              id: `${doc.id}-${image.id}`,
              projectId: doc.id,
              projectSlug: project.slug,
              projectName: project.name,
              category: project.category,
              publishedAt: project.publishedAt,
              image: image,
            });
          }
        });
      }
    });

    // Sort images by project publication date, descending (newest first)
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
