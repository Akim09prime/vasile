import { NextResponse, type NextRequest } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { getServerDb } from "@/lib/firebase-server-client";
import { Project, ImagePlaceholder } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function mapDataToProject(id: string, data: any): Project {
    const coverImage = PlaceHolderImages.find(p => p.id === data.coverMediaId);
    
    // Ensure media is an array
    const media = Array.isArray(data.media) ? data.media.filter((m: any): m is ImagePlaceholder => !!m && typeof m.imageUrl === 'string' && m.imageUrl.length > 0) : [];

    return {
        id: id,
        name: data.name,
        slug: data.slug,
        category: data.category,
        categorySlug: data.categorySlug,
        summary: data.summary,
        content: data.content,
        location: data.location,
        isPublished: data.isPublished,
        publishedAt: data.publishedAt?.toDate?.().toISOString(),
        completedAt: data.completedAt?.toDate?.().toISOString(),
        createdAt: data.createdAt?.toDate?.().toISOString(),
        coverMediaId: data.coverMediaId,
        media: media,
        image: coverImage || undefined,
    };
}

async function getProjectBySlug(slug: string): Promise<Project | null> {
    const db = getServerDb();
    const docRef = doc(db, "projects", slug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isPublished) {
            return mapDataToProject(docSnap.id, data);
        }
    }
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

    try {
        const project = await getProjectBySlug(slug);

        if (!project) {
            return NextResponse.json({ ok: false, error: "Project not found or not published." }, { status: 404 });
        }

        const headers = new Headers();
        headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

        return NextResponse.json({ ok: true, item: project }, { headers });

    } catch (error: any) {
        console.error(`[API] Error fetching project by slug ${slug}:`, error);
        return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
    }
}
