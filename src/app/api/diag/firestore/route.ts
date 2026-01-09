
import { NextResponse } from "next/server";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { app, db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET() {
  const runtimeProjectId = app?.options?.projectId ?? null;

  const emulatorHost =
    process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST ||
    process.env.FIRESTORE_EMULATOR_HOST ||
    null;

  const envProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null;

  // REAL read attempt (root collection)
  const targetPath = "project_summaries";

  try {
    const q = query(collection(db, targetPath), limit(1));
    const snap = await getDocs(q);

    return NextResponse.json({
      ok: true,
      runtimeProjectId,
      envProjectId,
      emulatorHost,
      targetPath,
      docsCount: snap.size,
      firstDocId: snap.docs[0]?.id ?? null,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        runtimeProjectId,
        envProjectId,
        emulatorHost,
        targetPath,
        errorName: e?.name ?? null,
        errorCode: e?.code ?? null,
        errorMessage: e?.message ?? String(e),
      },
      { status: 500 }
    );
  }
}
