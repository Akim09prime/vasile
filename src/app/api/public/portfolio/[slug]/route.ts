
import 'server-only';
import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { DocumentData } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { slug: string }}) {
    const { slug } = params;
    
    if (!slug) {
        return NextResponse.json({ ok: false, error: "Project slug or ID is required." }, { status: 400 });
    }

    const { db, info } = getAdminDb();

    if (!db || info.mode === 'none') {
        return NextResponse.json(
            { ok: false, error: 'Admin SDK not initialized.', adminInfo: info },
            { status: 500 }
        );
    }
    
    try {
        let projectDoc: DocumentData | null = null;
        let docId: string | null = null;

        // Strategy 1: Assume slug is the document ID and try to get it directly.
        const docRefById = db.collection('projects').doc(slug);
        const docSnapById = await docRefById.get();
        
        if (docSnapById.exists && docSnapById.data()?.isPublished) {
            projectDoc = docSnapById.data() as DocumentData;
            docId = docSnapById.id;
        } else {
            // Strategy 2: If not found by ID, query by the 'slug' field.
            const queryBySlug = db.collection('projects').where('slug', '==', slug).where('isPublished', '==', true).limit(1);
            const querySnap = await queryBySlug.get();
            if (!querySnap.empty) {
                const doc = querySnap.docs[0];
                projectDoc = doc.data();
                docId = doc.id;
            }
        }

        if (!projectDoc || !docId) {
            return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
        }
        
        // Convert Timestamps to ISO strings for serialization
        const serializedItem = Object.fromEntries(
            Object.entries(projectDoc).map(([key, value]) => {
                if (value && typeof value.toDate === 'function') {
                    return [key, value.toDate().toISOString()];
                }
                return [key, value];
            })
        );
        
        const finalItem = {
            id: docId,
            ...serializedItem
        }
        
        return NextResponse.json({ ok: true, item: finalItem });

    } catch (error: any) {
        console.error(`[API] Error in /api/public/portfolio/${slug}:`, error);
        return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
    }
}
