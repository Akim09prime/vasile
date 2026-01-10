
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { DocumentData } from 'firebase-admin/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getProjectBySlugOrId(slug: string): Promise<DocumentData | null> {
    const { db } = getAdminDb();
    if (!db) {
        throw new Error("Admin DB not initialized");
    }

    // 1. Try fetching by doc ID first, as it's the most efficient.
    const docRef = db.collection('project_summaries').doc(slug);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() };
    }

    // 2. If not found by ID, query by the 'slug' field.
    const querySnapshot = await db.collection('project_summaries')
        .where('slug', '==', slug)
        .limit(1)
        .get();
        
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    // 3. If still not found, query the main `projects` collection as a fallback.
    const projectQuerySnapshot = await db.collection('projects')
        .where('slug', '==', slug)
        .where('isPublished', '==', true)
        .limit(1)
        .get();

    if (!projectQuerySnapshot.empty) {
        const doc = projectQuerySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    return null;
}

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    const slug = params.slug;
    if (!slug) {
        return NextResponse.json({ ok: false, error: "Slug is required" }, { status: 400 });
    }

    try {
        const itemData = await getProjectBySlugOrId(slug);
        
        if (!itemData) {
            return NextResponse.json({ ok: false, error: 'not-found' }, { status: 404 });
        }
        
        // Ensure timestamps are converted to strings if they are Firestore Timestamps
        const toISO = (timestamp: any) => timestamp?.toDate?.().toISOString() || timestamp || null;
        
        const finalItem = {
            ...itemData,
            createdAt: toISO(itemData.createdAt),
            publishedAt: toISO(itemData.publishedAt),
            completedAt: toISO(itemData.completedAt),
            image: PlaceHolderImages.find(p => p.id === itemData.coverMediaId) || itemData.image || null,
            media: (itemData.mediaIds || itemData.media || []).map((idOrObj: string | ImagePlaceholder) => {
                if(typeof idOrObj === 'string') {
                    return PlaceHolderImages.find(p => p.id === idOrObj);
                }
                return idOrObj; // It's already an object
            }).filter(Boolean),
        };

        return NextResponse.json({ ok: true, item: finalItem });

    } catch (error: any) {
        console.error(`[API/public/portfolio/${slug}] Error:`, error);
        return NextResponse.json(
            { ok: false, error: error.message, code: error.code || 'internal-error' },
            { status: 500 }
        );
    }
}
