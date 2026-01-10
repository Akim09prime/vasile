
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public API endpoint to get a single project by its slug.
 * Uses Admin SDK to bypass Firestore rules for public access.
 */
export async function GET(request: Request, { params }: { params: { slug: string } }) {
    const { slug } = params;
    const { db, info: adminInfo } = getAdminDb();

    if (!slug) {
        return NextResponse.json({ ok: false, error: 'Slug parameter is missing' }, { status: 400 });
    }

    if (!db || adminInfo.mode === 'none') {
        console.error("[API/portfolio/slug] Admin DB not initialized.");
        return NextResponse.json({ ok: false, error: "Server error: Admin DB not configured." }, { status: 500 });
    }

    try {
        const projectsRef = db.collection('projects');
        const q = projectsRef.where('slug', '==', slug).limit(1);
        const snapshot = await q.get();

        if (snapshot.empty) {
            return NextResponse.json({ ok: false, error: 'Project not found' }, { status: 404 });
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        // Enforce that only published projects are publicly accessible via this endpoint.
        if (data.isPublished !== true) {
            return NextResponse.json({ ok: false, error: 'Project is not published' }, { status: 404 });
        }
        
        const coverImage = PlaceHolderImages.find(p => p.id === data.coverMediaId);

        // Normalize timestamp fields to ISO strings for consistent JSON response.
        const normalizeTimestamp = (timestamp: any) => {
            if (timestamp && typeof timestamp.toDate === 'function') {
                return timestamp.toDate().toISOString();
            }
            return null;
        };

        const item = {
            id: doc.id,
            name: data.name,
            slug: data.slug,
            category: data.category,
            categorySlug: data.categorySlug,
            summary: data.summary,
            content: data.content,
            location: data.location,
            isPublished: data.isPublished,
            publishedAt: normalizeTimestamp(data.publishedAt),
            completedAt: normalizeTimestamp(data.completedAt),
            createdAt: normalizeTimestamp(data.createdAt),
            coverMediaId: data.coverMediaId,
            media: data.media || [],
            image: coverImage || null,
        };

        return NextResponse.json({ ok: true, item });

    } catch (error: any) {
        console.error(`[API/portfolio/slug] Firestore query failed for slug "${slug}":`, error);
        return NextResponse.json(
            { ok: false, error: "Internal server error while fetching project.", details: error.message },
            { status: 500 }
        );
    }
}
