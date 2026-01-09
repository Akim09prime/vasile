
import { NextResponse } from "next/server";
import { getDocs, collection, query, where, limit } from "firebase/firestore";
import { db, isFirebaseConfigValid, firebaseInitializationError } from "@/lib/firebase";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isFirebaseConfigValid || !db) {
    return NextResponse.json({
      ok: false,
      error: "Client Firebase SDK is not configured correctly on the server.",
      code: "CLIENT_SDK_UNAVAILABLE",
      details: firebaseInitializationError?.message || "Unknown initialization error.",
    }, { status: 500 });
  }

  try {
    const collectionRef = collection(db, 'project_summaries');
    const q = query(collectionRef, where("isPublished", "==", true), limit(3));
    const snapshot = await getDocs(q);

    return NextResponse.json({
      ok: true,
      count: snapshot.size,
      sampleIds: snapshot.docs.map(doc => doc.id),
    });

  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: `Client SDK failed to execute public query: ${e.message}`,
      code: e.code || "UNKNOWN_FIRESTORE_ERROR",
    }, { status: 500 });
  }
}
