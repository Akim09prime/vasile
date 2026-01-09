
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin.server";
import { getServerDb } from "@/lib/firebase-server-client";
import { collection, query, where, limit, getCountFromServer } from "firebase/firestore";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const adminInfo = getAdminDb().info;
    let publicPortfolioStatus: { ok: boolean; count?: number; error?: string } = { ok: false };

    try {
        const serverDb = getServerDb();
        const q = query(collection(serverDb, 'project_summaries'), where("isPublished", "==", true), limit(1));
        const snapshot = await getCountFromServer(q);
        publicPortfolioStatus = { ok: true, count: snapshot.data().count };
    } catch (e: any) {
        publicPortfolioStatus = { ok: false, error: e.message || String(e) };
    }
    
    return NextResponse.json({
        ok: true,
        publicPortfolio: publicPortfolioStatus,
        adminSdk: {
            mode: adminInfo.mode,
            projectId: adminInfo.projectId,
            error: adminInfo.error || null,
        }
    });
}
