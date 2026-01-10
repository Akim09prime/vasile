
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint to get the slug of the first published portfolio item.
 * This is useful for scripting and testing API endpoints without hardcoding slugs.
 */
export async function GET() {
  const { db, info: adminInfo } = getAdminDb();

  if (!db || adminInfo.mode === 'none' || adminInfo.mode === 'failed') {
    return NextResponse.json({
      ok: false,
      error: 'Admin SDK not initialized or failed.',
      adminInfo: adminInfo,
    }, { status: 500 });
  }

  try {
    const summariesRef = db.collection('project_summaries');
    
    // Get total count of published projects
    const countSnapshot = await summariesRef.where('isPublished', '==', true).count().get();
    const count = countSnapshot.data().count;

    // Get the first published project, ordered by completion date
    const q = summariesRef
      .where('isPublished', '==', true)
      .orderBy('completedAt', 'desc')
      .limit(1);
      
    const snapshot = await q.get();

    if (snapshot.empty) {
      return NextResponse.json({
        ok: true,
        slug: null,
        count: 0,
        message: 'No published projects found in project_summaries.',
      });
    }

    const firstDoc = snapshot.docs[0];
    const slug = firstDoc.data()?.slug || firstDoc.id;

    return NextResponse.json({
      ok: true,
      slug: slug,
      count: count,
    });

  } catch (error: any) {
    console.error('[API/diag/first-portfolio-slug] Error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to query Firestore.',
      message: error.message,
      code: error.code,
    }, { status: 500 });
  }
}
