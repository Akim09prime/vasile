
import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin.server';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { defaultProjectTypes } from '@/lib/defaults';
import type { ProjectData } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

const slugify = (text: string) => text.toString().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]+/g, '')
  .replace(/--+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { db, info: dbInfo } = getAdminDb();
  const auth = getAdminAuth();
  
  if (!db || !auth || dbInfo.mode === 'none') {
    return NextResponse.json({ ok: false, error: 'Admin SDK not initialized.' }, { status: 500 });
  }

  // --- Authorization Check ---
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: Missing or invalid token.' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    const adminDoc = await db.collection('admins').doc(uid).get();
    if (!adminDoc.exists || adminDoc.data()?.allowed !== true) {
      return NextResponse.json({ ok: false, error: 'Forbidden: User is not an admin.' }, { status: 403 });
    }
  } catch (error: any) {
    console.error("Auth check failed:", error);
    return NextResponse.json({ ok: false, error: 'Unauthorized: Token verification failed.' }, { status: 401 });
  }
  // --- End Authorization Check ---
  
  let updated = 0;
  let skipped = 0;
  const errors: { id: string; error: string }[] = [];

  try {
    const projectsSnapshot = await db.collection('projects').get();
    const batchSize = 100;
    const batches = [];

    for (let i = 0; i < projectsSnapshot.docs.length; i += batchSize) {
        const batch = db.batch();
        const slice = projectsSnapshot.docs.slice(i, i + batchSize);
        
        for (const doc of slice) {
            try {
                const projectId = doc.id;
                const projectData = doc.data() as ProjectData;
                
                const coverImage = PlaceHolderImages.find(p => p.id === projectData.coverMediaId);
                const generatedSlug = projectData.slug || slugify(projectData.name);

                const summaryPayload = {
                    name: projectData.name,
                    slug: generatedSlug,
                    category: projectData.category,
                    categorySlug: defaultProjectTypes.find(pt => pt.label_ro === projectData.category)?.slug || 'uncategorized',
                    summary: projectData.summary,
                    location: projectData.location,
                    isPublished: projectData.isPublished,
                    publishedAt: projectData.isPublished ? (projectData.publishedAt || FieldValue.serverTimestamp()) : null,
                    createdAt: projectData.createdAt || FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                    coverMediaId: projectData.coverMediaId,
                    mediaIds: projectData.mediaIds || [],
                    image: coverImage ? {
                        id: coverImage.id,
                        imageUrl: coverImage.imageUrl,
                        description: coverImage.description,
                        imageHint: coverImage.imageHint,
                    } : null,
                };
                
                const summaryRef = db.collection('project_summaries').doc(projectId);
                batch.set(summaryRef, summaryPayload, { merge: true });

                // Also backfill the slug to the main project document if it's missing
                if (!projectData.slug) {
                    const projectRef = db.collection('projects').doc(projectId);
                    batch.update(projectRef, { slug: generatedSlug });
                }

                updated++;
            } catch (e: any) {
                errors.push({ id: doc.id, error: e.message });
            }
        }
        batches.push(batch.commit());
    }

    await Promise.all(batches);

    return NextResponse.json({ ok: true, updated, skipped: projectsSnapshot.size - updated, errors });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
  }
}
