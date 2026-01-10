
import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin.server";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Project } from "@/lib/types";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getProjectBySlug(slug: string): Promise<Project | null> {
    const { db } = getAdminDb();
    if (!db) {
        console.error("[API/PortfolioDetail] Admin DB not initialized.");
        return null;
    }
    
    const projectsRef = db.collection('projects');
    // First, try to query by the slug field
    const snapshotBySlug = await projectsRef.where('slug', '==', slug).limit(1).get();

    let doc;

    if (!snapshotBySlug.empty) {
        doc = snapshotBySlug.docs[0];
    } else {
        // If not found by slug, maybe the slug is actually a document ID
        const docById = await projectsRef.doc(slug).get();
        if (docById.exists) {
            doc = docById;
        } else {
            return null; // Not found by slug or ID
        }
    }
    
    const data = doc.data();
    if (!data || !data.isPublished) {
        return null;
    }

    // Resolve images and convert timestamps
    const coverImage = PlaceHolderImages.find(img => img.id === data.coverMediaId);
    
    let media = [];
    if (data.media && Array.isArray(data.media)) {
        media = data.media.map((item: any) => {
            const fullImage = PlaceHolderImages.find(p_img => p_img.id === item.id);
            return fullImage ? { ...item, ...fullImage } : item;
        });
    }

    const projectData: Project = {
        id: doc.id,
        name: data.name,
        slug: data.slug || slug,
        category: data.category,
        categorySlug: data.categorySlug,
        summary: data.summary,
        content: data.content,
        location: data.location,
        isPublished: data.isPublished,
        publishedAt: data.publishedAt?.toDate?.().toISOString() || null,
        completedAt: data.completedAt?.toDate?.().toISOString() || null,
        createdAt: data.createdAt?.toDate?.().toISOString() || null,
        coverMediaId: data.coverMediaId,
        media: media,
        image: coverImage || null,
    };

    return projectData;
}


export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
    const { slug } = params;

    if (!slug) {
        return NextResponse.json({ ok: false, error: "slug_required" }, { status: 400 });
    }

    try {
        const project = await getProjectBySlug(slug);

        if (!project) {
            return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
        }

        return NextResponse.json({ ok: true, item: project }, { status: 200 });

    } catch (e: any) {
        console.error(`[API/PortfolioDetail] Error fetching project for slug "${slug}":`, e);
        return NextResponse.json(
            { ok: false, error: e.message || 'Internal Server Error', code: e.code || 'UNKNOWN_ERROR' },
            { status: 500 }
        );
    }
}
