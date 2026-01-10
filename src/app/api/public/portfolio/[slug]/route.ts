import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Project, ImagePlaceholder } from "@/lib/types";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getProjectBySlugOrId(slugOrId: string): Promise<Project | null> {
    const { db } = getAdminDb();
    if (!db) {
        console.error("[ProjectAPI] Admin DB not initialized.");
        return null;
    }
    
    const projectsRef = db.collection('projects');
    // First, try to query by slug
    let snapshot = await projectsRef.where('slug', '==', slugOrId).limit(1).get();

    // If no result, try to get by document ID as a fallback
    if (snapshot.empty) {
        const docById = await projectsRef.doc(slugOrId).get();
        if (docById.exists) {
            // Create a temporary snapshot-like structure
            snapshot = { docs: [docById] } as any;
        }
    }

    if (snapshot.empty || !snapshot.docs[0]) {
        return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    if (!data || !data.isPublished) {
        return null;
    }
    
    const projectData: Project = { 
        id: doc.id,
        name: data.name,
        slug: data.slug,
        category: data.category,
        categorySlug: data.categorySlug,
        summary: data.summary,
        content: data.content,
        location: data.location,
        isPublished: data.isPublished,
        // Safely convert Timestamps to ISO strings
        publishedAt: data.publishedAt?.toDate?.().toISOString() || null,
        completedAt: data.completedAt?.toDate?.().toISOString() || null,
        createdAt: data.createdAt?.toDate?.().toISOString() || null,
        coverMediaId: data.coverMediaId,
        media: [], // Will be populated below
    };

    // Manually resolve image URLs
    projectData.image = PlaceHolderImages.find(img => img.id === projectData.coverMediaId) || undefined;
    if (data.media && Array.isArray(data.media)) {
        projectData.media = data.media.map((item: any) => {
            const fullImage = PlaceHolderImages.find(p_img => p_img.id === item.id);
            return fullImage ? { ...item, ...fullImage } : item;
        }).filter(Boolean);
    }
    
    return projectData;
}

export async function GET(request: Request, { params }: { params: { slug: string }}) {
    const { slug } = params;

    if (!slug) {
        return NextResponse.json({ ok: false, error: 'Project slug is required.' }, { status: 400 });
    }

    try {
        const project = await getProjectBySlugOrId(slug);

        if (!project) {
            return NextResponse.json({ ok: false, error: 'Project not found or not published.' }, { status: 404 });
        }
        
        return NextResponse.json({ ok: true, item: project });
    } catch (error: any) {
        console.error(`[API/public/portfolio/${slug}] Error:`, error);
        return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
    }
}
