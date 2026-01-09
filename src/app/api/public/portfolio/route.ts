
import 'server-only';
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { ProjectSummary } from '@/lib/types';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const { db, info } = getAdminDb();
    if (!db || info.mode === 'none') {
        return NextResponse.json({ ok: false, error: "Admin SDK not initialized.", items: [] }, { status: 500 });
    }

    try {
        const summariesRef = collection(db, 'project_summaries');
        
        // Fetch published summaries, sorted by publish or creation date.
        // This is a more lenient query that won't exclude documents missing 'completedAt'.
        const q = query(
            summariesRef, 
            where("isPublished", "==", true),
            orderBy("publishedAt", "desc"), // Primary sort key in Firestore
            limit(100) // Safeguard
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("[API/Portfolio] No published project summaries found.");
            return NextResponse.json({ ok: true, items: [] });
        }

        let items = snapshot.docs.map(doc => {
            const data = doc.data();
            const docId = doc.id;
            
            // Convert Firestore Timestamps to ISO strings if they exist
            const toISO = (timestamp: any) => timestamp?.toDate?.().toISOString() || null;

            return {
                id: docId,
                name: data.name,
                slug: data.slug,
                category: data.category,
                categorySlug: data.categorySlug,
                summary: data.summary,
                location: data.location,
                isPublished: data.isPublished,
                image: data.image || null,
                publishedAt: toISO(data.publishedAt),
                completedAt: toISO(data.completedAt),
                createdAt: toISO(data.createdAt),
            } as ProjectSummary;
        });
        
        // Perform final, robust sorting in JavaScript.
        // This correctly handles cases where 'completedAt' might be null.
        items.sort((a, b) => {
            const dateA = new Date(a.completedAt || a.publishedAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.completedAt || b.publishedAt || b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        console.log(`[API/Portfolio] Fetched and sorted ${items.length} items.`);
        return NextResponse.json({ ok: true, items });

    } catch (error: any) {
        console.error("[API/Portfolio] Error fetching portfolio:", error);
        return NextResponse.json({ ok: false, error: error.message, code: error.code, items: [] }, { status: 500 });
    }
}
