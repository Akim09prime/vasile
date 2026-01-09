
import { NextResponse } from "next/server";
import { firebaseConfig } from "@/lib/firebase-config";
import { getAdminDb } from "@/lib/firebase-admin.server";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = getAdminDb();
  const apiKey = firebaseConfig.apiKey || '';

  const clientFirebaseInfo = {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKeyLen: apiKey.length,
    apiKeyPrefixSuffix: apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : 'N/A',
  };

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    clientFirebase: clientFirebaseInfo,
    adminFirebase: admin.info,
  });
}
