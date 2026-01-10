import 'server-only';
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Project, ImagePlaceholder } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

async function getProjectBySlugOrId(slug: string): Promise<Project | null> {
    const { db } = getAdminDb();
    if (!db) {
        throw new Error("Admin DB not initialized.");
    }
    
    const projectsRef = db.collection('projects');
    const snapshotBySlug = await projectsRef.where('slug', '==', slug).where('isPublished', '==', true).limit(1).get();

    let docSnap;
    if (!snapshotBySlug.empty) {
        docSnap = snapshotBySlug.docs[0];
    } else {
        const docById = await projectsRef.doc(slug).get();
        if (docById.exists && docById.data()?.isPublished) {
            docSnap = docById;
        } else {
            return null;
        }
    }
    
    if (!docSnap || !docSnap.exists) {
        return null;
    }

    const data = docSnap.data();
    if (!data) return null;

    const toISOString = (timestamp: Timestamp | Date | string | undefined): string | undefined => {
        if (!timestamp) return undefined;
        if (timestamp instanceof Timestamp) return timestamp.toDate().toISOString();
        if (timestamp instanceof Date) return timestamp.toISOString();
        if (typeof timestamp === 'string') return new Date(timestamp).toISOString();
        return undefined;
    };
    
    const projectData: Project = {
        id: docSnap.id,
        name: data.name,
        slug: data.slug,
        category: data.category,
        categorySlug: data.categorySlug,
        summary: data.summary,
        content: data.content,
        location: data.location,
        isPublished: data.isPublished,
        publishedAt: toISOString(data.publishedAt),
        completedAt: toISOString(data.completedAt),
        createdAt: toISOString(data.createdAt) || new Date().toISOString(),
        coverMediaId: data.coverMediaId,
        media: (data.media || []).map((item: any) => {
            const fullImage = PlaceHolderImages.find(p_img => p_img.id === (item.id || item));
            return fullImage ? { ...item, ...fullImage } : item;
        }).filter((m: any) => m.imageUrl),
        image: PlaceHolderImages.find(img => img.id === data.coverMediaId),
    };

    return projectData;
}


export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const item = await getProjectBySlugOrId(params.slug);
    
    if (!item) {
      return NextResponse.json({ ok: false, error: 'Project not found or not published' }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true, item });

  } catch (error: any) {
    console.error(`[API/public/portfolio/${params.slug}] GET Error:`, error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch project details.', details: error.message },
      { status: 500 }
    );
  }
}
