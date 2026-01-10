
import 'server-only';
import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin.server";
import type { ProjectSummary } from "@/lib/types";
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getProject(db: any, slug: string): Promise<any | null> {
    
    // Attempt 1: Fetch by doc ID, assuming slug is the ID
    const docByIdRef = db.collection('project_summaries').doc(slug);
    const docByIdSnap = await docByIdRef.get();
    if (docByIdSnap.exists) {
        console.log(`[API/portfolio/slug] Found project by ID: ${slug}`);
        return { id: docByIdSnap.id, ...docByIdSnap.data() };
    }

    // Attempt 2: Query by the 'slug' field
    const queryBySlugRef = db.collection('project_summaries').where('slug', '==', slug).limit(1);
    const queryBySlugSnap = await queryBySlugRef.get();
    if (!queryBySlugSnap.empty) {
        const doc = queryBySlugSnap.docs[0];
        console.log(`[API/portfolio/slug] Found project by slug field: ${slug}`);
        return { id: doc.id, ...doc.data() };
    }

    console.log(`[API/portfolio/slug] Project not found for slug/ID: ${slug}`);
    return null;
}


export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const { slug } = params;

    if (!slug) {
        return NextResponse.json({ ok: false, error: "Project slug is required." }, { status: 400 });
    }

    const { db, info } = getAdminDb();

    if (!db) {
        return NextResponse.json({ ok: false, error: 'Admin SDK not initialized.', adminInfo: info }, { status: 500 });
    }
    
    try {
        const item = await getProject(db, slug);

        if (!item) {
            return NextResponse.json({ ok: false, error: 'not-found' }, { status: 404 });
        }
        
        // Resolve cover image and media gallery
        if (item.coverMediaId) {
            item.image = PlaceHolderImages.find(img => img.id === item.coverMediaId) || null;
        }

        if (item.media && Array.isArray(item.media) && item.media.length > 0) {
            // If media contains full objects, use them. If it contains IDs, resolve them.
             if (typeof item.media[0] === 'string') {
                 item.media = item.media.map((id: string) => PlaceHolderImages.find(img => img.id === id)).filter(Boolean);
             }
        } else {
             item.media = [];
        }


        // Convert Timestamps to ISO strings for serialization
        const toISO = (timestamp: any) => timestamp?.toDate?.().toISOString() || null;
        item.createdAt = toISO(item.createdAt);
        item.publishedAt = toISO(item.publishedAt);
        item.completedAt = toISO(item.completedAt);
        item.updatedAt = toISO(item.updatedAt);
        
        return NextResponse.json({ ok: true, item });

    } catch (error: any) {
        console.error(`[API/portfolio/slug] Error fetching project for slug "${slug}":`, error);
        return NextResponse.json({ ok: false, error: error.message, code: error.code || 'UNKNOWN_ERROR' }, { status: 500 });
    }
}
