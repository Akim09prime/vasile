
import { NextResponse, type NextRequest } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { getServerDb } from "@/lib/firebase-server-client";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ ok: false, error: "Project ID is required as a query parameter." }, { status: 400 });
    }

    try {
        const db = getServerDb();
        const docRef = doc(db, "project_summaries", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
             return NextResponse.json({
                ok: true,
                id,
                exists: false,
                hasCover: false,
                keys: []
            });
        }
        
        const data = docSnap.data();

        return NextResponse.json({
            ok: true,
            id,
            exists: true,
            hasCover: !!data.image?.imageUrl,
            keys: Object.keys(data),
        });

    } catch (error: any) {
        console.error(`[API] Error in diag portfolio-detail-test for ID ${id}:`, error);
        return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
    }
}
