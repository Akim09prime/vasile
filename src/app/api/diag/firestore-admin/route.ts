
import { NextResponse } from "next/server";
import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function getPrivateKey() {
  // Keys from .env often have escaped newlines
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
  return key.replace(/\\n/g, "\n");
}

function getAdminApp(): App {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = getPrivateKey();
    
    const appName = "firebase-admin-app-diagnostics";
    const existingApp = getApps().find(app => app.name === appName);
    if (existingApp) {
        return existingApp;
    }
    
    return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      }, appName);
}


export async function GET() {
  try {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || null;

    if (!projectId || !clientEmail || !process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY.includes("PASTE_YOUR_PRIVATE_KEY_HERE")) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing or incomplete admin env vars. Required: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY. Please ensure the private key is pasted correctly.",
          projectId,
          clientEmailPresent: !!clientEmail,
          privateKeyPresent: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
          privateKeyIsPlaceholder: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.includes("PASTE_YOUR_PRIVATE_KEY_HERE")
        },
        { status: 500 }
      );
    }

    const adminApp = getAdminApp();
    const db = getFirestore(adminApp);

    const targetPath = "project_summaries";
    const snap = await db.collection(targetPath).limit(1).get();

    return NextResponse.json({
      ok: true,
      adminProjectId: projectId,
      targetPath,
      docsCount: snap.size,
      firstDocId: snap.docs[0]?.id ?? null,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        errorName: e?.name ?? null,
        errorMessage: e?.message ?? String(e),
        errorStack: e?.stack,
      },
      { status: 500 }
    );
  }
}
