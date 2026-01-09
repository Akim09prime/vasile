
import { NextResponse, NextRequest } from "next/server";
import { getServerDb } from "@/lib/firebase-server-client";
import { collection, getDocs, query, where, orderBy, LimitConstraint, limit, Query } from "firebase/firestore";
import type { ProjectSummary } from '@/lib/types';

export const runtime = 'nodejs';
// This can be revalidated on-demand or by a time-based interval
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET(request: NextRequest) {
    const db = getServerDb();
    
    try {
        const q = query(
            collection(db, 'project_summaries'),
            where("isPublished", "==", true),
            orderBy("completedAt", "desc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ ok: true, items: [] });
        }

        const items: ProjectSummary[] = snapshot.docs.map(doc => {
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
                // Ensure dates are converted to ISO strings
                publishedAt: data.publishedAt?.toDate()?.toISOString() || null,
                completedAt: data.completedAt?.toDate()?.toISOString() || null,
                createdAt: data.createdAt?.toDate()?.toISOString() || null,
                image: data.image || null,
            } as ProjectSummary;
        });

        // Fallback sorting logic in code
        items.sort((a, b) => {
            const dateA = a.completedAt ? new Date(a.completedAt) : (a.publishedAt ? new Date(a.publishedAt) : (a.createdAt ? new Date(a.createdAt) : new Date(0)));
            const dateB = b.completedAt ? new Date(b.completedAt) : (b.publishedAt ? new Date(b.publishedAt) : (b.createdAt ? new Date(b.createdAt) : new Date(0)));
            return dateB.getTime() - dateA.getTime();
        });


        return NextResponse.json({ ok: true, items });

    } catch (error: any) {
        console.error("[API/public/portfolio] Firestore Error:", {
            message: error.message,
            code: error.code,
        });

        const errorMessage = error.code === 'failed-precondition'
            ? 'Query requires a composite index. Please create it in your Firebase console.'
            : `Failed to fetch portfolio: ${error.message}`;

        return NextResponse.json(
            { ok: false, error: errorMessage, code: error.code },
            { status: 500 }
        );
    }
}
