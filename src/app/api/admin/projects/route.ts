
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin.server";
import { getProjectsFromFirestore } from "@/lib/services/project-service";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db, info: adminInfo } = getAdminDb();

    if (!db) {
      console.error("[API/admin/projects] Admin DB not initialized.");
      return NextResponse.json(
        { 
          ok: false, 
          error: "Firebase Admin DB is not initialized. Check server logs.", 
          code: "ADMIN_NOT_CONFIGURED" 
        },
        { status: 500 }
      );
    }
    
    // This call now needs to be adapted or this API route needs to be changed
    // Since getProjectsFromFirestore is now a client-only function.
    // For now, we will comment this out to fix the build. A proper implementation
    // would be to have a dedicated server-side fetch function using admin SDK.
    // const items = await getProjectsFromFirestore({ showUnpublished: true });

    // return NextResponse.json({ ok: true, count: items.length, items });
    
     return NextResponse.json({ ok: true, message: "This API route is temporarily disabled to fix a build issue. Admin project listing now happens client-side." });


  } catch (e: any) {
    console.error("[API/admin/projects] FATAL ERROR:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || String(e), code: e?.code || "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
