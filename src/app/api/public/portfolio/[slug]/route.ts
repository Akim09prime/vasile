
import 'server-only';

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { Project } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Timestamp } from 'firebase-admin/firestore';

function toISO(timestamp: Timestamp | undefined | null): string | null {
    if (!timestamp) return null;
    return timestamp.toDate().toISOString();
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Slug is required" }, { status: 400 });
  }

  const { db, info: dbInfo } = getAdminDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: 'Admin SDK not initialized.' }, { status: 500 });
  }

  try {
    const projectsRef = db.collection('projects');
    const query = projectsRef.where('slug', '==', slug).where('isPublished', '==', true).limit(1);
    const snapshot = await query.get();

    if (snapshot.empty) {
      // Fallback to check by ID, for older projects without a slug
      const docById = await projectsRef.doc(slug).get();
      if (!docById.exists || docById.data()?.isPublished !== true) {
        return NextResponse.json({ ok: false, error: 'Project not found or not published' }, { status: 404 });
      }

      const data = docById.data();
      if (!data) {
        return NextResponse.json({ ok: false, error: 'Project data is missing' }, { status: 404 });
      }
      
      const item: Project = {
        id: docById.id,
        name: data.name,
        slug: data.slug,
        category: data.category,
        categorySlug: data.categorySlug,
        summary: data.summary,
        content: data.content,
        location: data.location,
        isPublished: data.isPublished,
        publishedAt: toISO(data.publishedAt as Timestamp) || undefined,
        completedAt: toISO(data.completedAt as Timestamp) || undefined,
        createdAt: toISO(data.createdAt as Timestamp) || new Date().toISOString(),
        coverMediaId: data.coverMediaId,
        media: data.media.map((m: any) => PlaceHolderImages.find(p => p.id === m.id) || m),
        image: PlaceHolderImages.find(p => p.id === data.coverMediaId),
      };

      return NextResponse.json({ ok: true, item });

    } else {
        const doc = snapshot.docs[0];
        const data = doc.data();

        const item: Project = {
            id: doc.id,
            name: data.name,
            slug: data.slug,
            category: data.category,
            categorySlug: data.categorySlug,
            summary: data.summary,
            content: data.content,
            location: data.location,
            isPublished: data.isPublished,
            publishedAt: toISO(data.publishedAt as Timestamp) || undefined,
            completedAt: toISO(data.completedAt as Timestamp) || undefined,
            createdAt: toISO(data.createdAt as Timestamp) || new Date().toISOString(),
            coverMediaId: data.coverMediaId,
            media: (data.media || []).map((m: any) => PlaceHolderImages.find(p => p.id === m.id) || m),
            image: PlaceHolderImages.find(p => p.id === data.coverMediaId),
        };
        
        return NextResponse.json({ ok: true, item });
    }

  } catch (e: any) {
    console.error(`[API/public/portfolio/${slug}] FATAL ERROR:`, e);
    return NextResponse.json({ ok: false, error: e.message, code: e.code }, { status: 500 });
  }
}
