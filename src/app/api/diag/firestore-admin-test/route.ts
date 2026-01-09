
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin.server";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

export async function GET() {
  const { db, info } = getAdminDb();

  if (!db || info.mode === 'none') {
    return NextResponse.json({
      ok: false,
      adminMode: info.mode,
      projectId: info.projectId,
      error: "Admin SDK not initialized or failed to initialize.",
      code: "ADMIN_SDK_UNAVAILABLE",
      adminInfo: info,
    }, { status: 500 });
  }

  try {
    const collectionRef = db.collection('project_summaries');
    const snapshot = await collectionRef.limit(3).get();

    return NextResponse.json({
      ok: true,
      count: snapshot.size,
      adminMode: info.mode,
      projectId: info.projectId,
      sampleIds: snapshot.docs.map(doc => doc.id),
    });

  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      adminMode: info.mode,
      projectId: info.projectId,
      error: `Admin SDK failed to read from Firestore: ${e.message}`,
      code: e.code || "UNKNOWN_FIRESTORE_ERROR",
    }, { status: 500 });
  }
}
