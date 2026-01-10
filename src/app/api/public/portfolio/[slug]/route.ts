
import { NextResponse, type NextRequest } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { getServerDb } from "@/lib/firebase-server-client";
import type { Project, ImagePlaceholder } from "@/lib/types";

// Ensures the component is treated as a dynamic route
export const dynamic = 'force-dynamic';


function normalizeDate(date: any): string | null {
    if (!date) return null;
    if (typeof date.toDate === 'function') { // Firebase Timestamp
        return date.toDate().toISOString();
    }
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
        return d.toISOString();
    }
    return null;
}


export async function GET(request: NextRequest, { params }: { params: { slug: string }}) {
    const { slug } = params;

    if (!slug) {
        return NextResponse.json({ ok: false, error: "Project slug is required." }, { status: 400 });
    }

    try {
        const db = getServerDb();
        // The document ID in 'project_summaries' is the same as in 'projects'
        // We fetch from 'projects' to get the full 'content' field.
        const docRef = doc(db, "projects", slug);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
             return NextResponse.json({
                ok: false,
                error: 'not_found',
                message: `Project with slug/id '${slug}' not found.`
            }, { status: 404 });
        }
        
        const data = docSnap.data();

        // Ensure the project is published before returning it
        if (data.isPublished !== true) {
             return NextResponse.json({
                ok: false,
                error: 'not_published',
                message: `Project with slug '${slug}' is not published.`
            }, { status: 403 });
        }

        const item: Project = {
            id: docSnap.id,
            name: data.name,
            slug: data.slug,
            category: data.category,
            summary: data.summary,
            content: data.content, // Include the detailed content
            location: data.location,
            isPublished: data.isPublished,
            publishedAt: normalizeDate(data.publishedAt),
            completedAt: normalizeDate(data.completedAt),
            createdAt: normalizeDate(data.createdAt),
            coverMediaId: data.coverMediaId,
            media: data.media || [],
            image: data.image || null,
        };

        return NextResponse.json({ ok: true, item: item });

    } catch (error: any) {
        console.error(`[API] Error fetching project by slug ${slug}:`, error);
        return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
    }
}
