import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin.server";
import { getProjectsFromFirestore } from "@/lib/services/project-service";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

// This file should have been named route.ts
// Corrected in this change.
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
    
    // The original call here was to a client-side function, which is incorrect.
    // This API route is currently not used by the frontend, so we return a stable message.
     return NextResponse.json({ ok: true, message: "Admin projects endpoint. Data is fetched client-side in the admin panel." });


  } catch (e: any) {
    console.error("[API/admin/projects] FATAL ERROR:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || String(e), code: e?.code || "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
