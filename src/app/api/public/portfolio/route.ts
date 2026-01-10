import 'server-only';
import { NextResponse } from 'next/server';
import { getAdminDb } from "@/lib/firebase-admin.server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { db, info: adminInfo } = getAdminDb();

  if (!db) {
    console.error("[API/public/portfolio] Admin DB not initialized.");
    return NextResponse.json(
      { 
        ok: false, 
        error: "Server configuration error. Check server logs.", 
        code: "ADMIN_DB_UNAVAILABLE",
        items: []
      },
      { status: 500 }
    );
  }

  try {
    const snapshot = await db
      .collection('project_summaries')
      .where('isPublished', '==', true)
      .orderBy('publishedAt', 'desc')
      .limit(100)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const toISO = (timestamp: any) => timestamp?.toDate?.().toISOString() || null;

    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        category: data.category,
        categorySlug: data.categorySlug,
        summary: data.summary,
        location: data.location,
        isPublished: data.isPublished,
        publishedAt: toISO(data.publishedAt),
        completedAt: toISO(data.completedAt),
        createdAt: toISO(data.createdAt),
        image: data.image || null,
      };
    });
    
    // Perform final sort in JS to guarantee order by completedAt > publishedAt > createdAt
    items.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.publishedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.completedAt || b.publishedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
    });

    return NextResponse.json({ ok: true, items });

  } catch (e: any) {
    console.error(`[API/public/portfolio] FATAL ERROR: ${e.message}`, { code: e.code, stack: e.stack });
    return NextResponse.json(
      { 
        ok: false, 
        error: "A server error occurred while fetching the portfolio.", 
        code: e.code || 'UNKNOWN_ERROR',
        items: [] 
      },
      { status: 500 }
    );
  }
}
