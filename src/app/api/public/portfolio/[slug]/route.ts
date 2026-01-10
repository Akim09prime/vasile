
import 'server-only';
import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin.server";
import type { DocumentData } from 'firebase-admin/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from '@/lib/types';


function resolveMedia(docData: DocumentData): DocumentData {
    const data = { ...docData };

    // Resolve cover image
    if (data.coverMediaId) {
        data.image = PlaceHolderImages.find(p => p.id === data.coverMediaId) || null;
    } else if (data.image && data.image.id) { // If image object is already there but needs full data
         data.image = PlaceHolderImages.find(p => p.id === data.image.id) || data.image;
    }

    // Resolve gallery media
    // The summary might contain full media objects or just IDs. We need to handle both.
    const mediaIds = data.media?.map((m: any) => m.id || m) || [];
    
    if (Array.isArray(mediaIds) && mediaIds.length > 0) {
        data.media = mediaIds
            .map((id: string) => PlaceHolderImages.find(p => p.id === id))
            .filter((p): p is ImagePlaceholder => !!p);
    } else {
        data.media = [];
    }

    return data;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { slug: string }}) {
    const { slug } = params;

    if (!slug) {
        return NextResponse.json({ ok: false, error: "Project slug is required." }, { status: 400 });
    }

    const { db, info } = getAdminDb();
    if (!db || info.mode === 'none') {
        return NextResponse.json({ ok: false, error: "Admin SDK not initialized." }, { status: 500 });
    }

    try {
        let docSnap;
        const summariesRef = db.collection('project_summaries');
        
        // 1. Try to get by doc ID first (most efficient)
        docSnap = await summariesRef.doc(slug).get();
        
        // 2. If not found by ID, query by slug field (fallback)
        if (!docSnap.exists) {
            const querySnapshot = await summariesRef.where('slug', '==', slug).limit(1).get();
            if (!querySnapshot.empty) {
                docSnap = querySnapshot.docs[0];
            }
        }

        if (!docSnap.exists) {
            return NextResponse.json({ ok: false, error: "not-found", message: `Project with slug/id '${slug}' not found.` }, { status: 404 });
        }

        let item = docSnap.data();
        if (item) {
            item.id = docSnap.id; // Ensure ID is part of the returned object
            item = resolveMedia(item);
        }
        
        return NextResponse.json({ ok: true, item });
    } catch (e: any) {
        console.error(`[API/portfolio/slug] Error fetching project '${slug}':`, e);
        return NextResponse.json({ ok: false, error: e.message, code: e.code }, { status: 500 });
    }
}
