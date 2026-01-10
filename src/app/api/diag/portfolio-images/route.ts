

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import type { ProjectSummary } from '@/lib/types';
import type { Query } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function analyzeUrl(url: string | undefined | null): any {
  if (!url) {
    return { hostname: null, isHttps: false, hasTokenParam: false, isFirebaseStorageUrl: false, looksLikeRelative: false };
  }
  try {
    const urlObject = new URL(url);
    const hostname = urlObject.hostname;
    const isFirebase = hostname.endsWith('firebasestorage.googleapis.com') || hostname.endsWith('storage.googleapis.com');
    return {
      hostname,
      isHttps: urlObject.protocol === 'https:',
      hasTokenParam: urlObject.searchParams.has('token'),
      isFirebaseStorageUrl: isFirebase,
      looksLikeRelative: false,
    };
  } catch (e) {
    // Not a full URL
    return {
      hostname: null,
      isHttps: false,
      hasTokenParam: false,
      isFirebaseStorageUrl: false,
      looksLikeRelative: url.startsWith('/'),
    };
  }
}

export async function GET() {
  const { db } = getAdminDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: 'Admin SDK not initialized' }, { status: 500 });
  }

  try {
    const summariesRef = db.collection('project_summaries');
    const q = summariesRef.where('isPublished', '==', true).limit(5);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return NextResponse.json({ ok: true, count: 0, samples: [] });
    }

    const samples = snapshot.docs.map(doc => {
      const data = doc.data();
      const coverUrl = data.image?.imageUrl || data.coverMedia?.url || null;
      const analysis = analyzeUrl(coverUrl);

      return {
        id: doc.id,
        coverUrl: coverUrl,
        ...analysis
      };
    });

    return NextResponse.json({
      ok: true,
      count: snapshot.size,
      samples,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
  }
}
