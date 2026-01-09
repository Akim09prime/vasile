
import { NextResponse } from 'next/server';
import { getServerDb } from '@/lib/firebase-server-client';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { ProjectSummary, GalleryImage, ImagePlaceholder } from '@/lib/types';

export const runtime = 'nodejs';
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
    const db = getServerDb();
    
    try {
        const q = query(
            collection(db, 'project_summaries'),
            where("isPublished", "==", true)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ ok: true, items: [] });
        }

        const topRatedImages: GalleryImage[] = [];

        snapshot.docs.forEach(doc => {
            const project = doc.data() as ProjectSummary;
            const media = Array.isArray(project.media) ? project.media : [];

            media.forEach((image: ImagePlaceholder) => {
                // An image is "top" if it has isTop: true OR rating: 5
                if (image.isTop === true || image.rating === 5) {
                    topRatedImages.push({
                        id: `${project.id}-${image.id}`,
                        projectId: project.id,
                        projectSlug: project.slug,
                        projectName: project.name,
                        category: project.category,
                        publishedAt: project.publishedAt,
                        image: {
                            id: image.id,
                            imageUrl: image.imageUrl,
                            description: image.description,
                            imageHint: image.imageHint,
                            rating: image.rating,
                            isTop: image.isTop,
                        }
                    });
                }
            });
        });
        
        // Sort images by project publication date, newest first
        topRatedImages.sort((a, b) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0);
            const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });


        return NextResponse.json({ ok: true, items: topRatedImages });

    } catch (error: any) {
        console.error("[API/public/gallery] Firestore Error:", {
            message: error.message,
            code: error.code,
        });

        return NextResponse.json(
            { ok: false, error: `Failed to fetch gallery: ${error.message}`, code: error.code },
            { status: 500 }
        );
    }
}
