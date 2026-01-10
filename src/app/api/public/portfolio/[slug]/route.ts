
import 'server-only';
import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin.server";
import { DocumentData } from 'firebase-admin/firestore';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function findImage(id?: string): ImagePlaceholder | null {
    if (!id) return null;
    return PlaceHolderImages.find(p => p.id === id) || null;
}

export async function GET(request: NextRequest, { params }: { params: { slug: string }}) {
    const { slug } = params;
    
    if (!slug) {
        return NextResponse.json({ ok: false, error: "Project slug is required." }, { status: 400 });
    }

    const { db, info } = getAdminDb();
    if (!db) {
        return NextResponse.json({ ok: false, error: 'Admin SDK not available.', adminInfo: info }, { status: 500 });
    }

    let docSnap: DocumentData | null = null;
    
    try {
        // Strategy 1: Attempt to get by doc ID directly (slug might be the ID)
        const docByIdRef = db.collection('project_summaries').doc(slug);
        const docByIdSnap = await docByIdRef.get();
        if (docByIdSnap.exists) {
            docSnap = docByIdSnap;
        } else {
            // Strategy 2: Query by the 'slug' field
            const queryBySlug = db.collection('project_summaries').where('slug', '==', slug).limit(1);
            const querySnap = await queryBySlug.get();
            if (!querySnap.empty) {
                docSnap = querySnap.docs[0];
            }
        }

        if (!docSnap) {
            return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
        }
        
        const data = docSnap.data();
        if (!data) {
             return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
        }

        // Reconstruct the full project object, resolving media IDs
        const item = {
            id: docSnap.id,
            ...data,
            // Ensure timestamps are ISO strings, which is what client expects
            createdAt: data.createdAt?.toDate?.().toISOString() || null,
            publishedAt: data.publishedAt?.toDate?.().toISOString() || null,
            completedAt: data.completedAt?.toDate?.().toISOString() || null,
            // Resolve image objects from IDs
            image: findImage(data.coverMediaId),
            media: Array.isArray(data.media) ? data.media.map((m: any) => findImage(m.id)).filter(Boolean) : [],
        };
        
        return NextResponse.json({ ok: true, item });
        
    } catch (error: any) {
        console.error(`[API/public/portfolio/${slug}] Error:`, error);
        return NextResponse.json({ ok: false, error: 'Internal server error', code: error.code }, { status: 500 });
    }
}
