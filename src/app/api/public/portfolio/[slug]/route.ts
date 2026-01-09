

import { NextResponse, type NextRequest } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { getServerDb } from "@/lib/firebase-server-client";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { slug: string }}) {
    const { slug } = params;

    if (!slug) {
        return NextResponse.json({ ok: false, error: "Project slug is required." }, { status: 400 });
    }

    try {
        const db = getServerDb();
        // NOTE: We fetch from 'projects' collection now, not 'project_summaries', 
        // to get the full `content` and `media` fields which might not be in the summary.
        // We use the slug as the document ID, which is how it's being created in project-service.
        const docRef = doc(db, "projects", slug);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data()?.isPublished === false) {
             return NextResponse.json({
                ok: false,
                error: "Project not found or not published.",
            }, { status: 404 });
        }
        
        const data = docSnap.data();

        // Ensure dates are serialized correctly
        const item = {
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
            completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        }

        return NextResponse.json({
            ok: true,
            item: item
        });

    } catch (error: any) {
        console.error(`[API] Error in public/portfolio/[slug] for slug ${slug}:`, error);
        return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
    }
}
