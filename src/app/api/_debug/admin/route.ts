
import 'server-only';

import { NextResponse } from 'next/server';
import { getAdminDb } from "@/lib/firebase-admin.server";
import fs from 'node:fs';

export const runtime="nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const { info } = getAdminDb();

    return NextResponse.json({ 
        ok: true, 
        adminMode: info.mode, 
        source: info.source, 
        projectId: info.projectId, 
        hasCreds: info.hasCreds, 
        error: info.error ?? null,
        cwd: process.cwd(),
        nodeEnv: process.env.NODE_ENV ?? null,
        hasEnvJson: !!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON,
        hasSplitEnv: !!(process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY),
        hasSaPathEnv: !!process.env.FIREBASE_ADMIN_SA_PATH,
        saPathEnv: process.env.FIREBASE_ADMIN_SA_PATH ? "[set]" : null,
        secretsFileExists: fs.existsSync(`${process.cwd()}/.secrets/firebase-admin.json`)
    });
}
