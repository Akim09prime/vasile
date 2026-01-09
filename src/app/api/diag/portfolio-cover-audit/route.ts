
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getUrlPrefix(url: any): string | null {
  if (typeof url !== 'string' || !url) {
    return null;
  }
  return url.substring(0, 40);
}

export async function GET() {
  const { db, info } = getAdminDb();

  if (!db) {
    return NextResponse.json(
      { ok: false, error: 'Admin SDK not available.', adminInfo: info },
      { status: 500 }
    );
  }

  try {
    const projectsSnapshot = await db.collection('projects').where('isPublished', '==', true).limit(10).get();
    if (projectsSnapshot.empty) {
      return NextResponse.json({ ok: true, samples: [] });
    }

    const auditPromises = projectsSnapshot.docs.map(async (projectDoc) => {
      const projectId = projectDoc.id;
      const projectData = projectDoc.data();
      const summaryDoc = await db.collection('project_summaries').doc(projectId).get();

      const projectCoverUrl = projectData.image?.imageUrl || projectData.coverMedia?.url || null;

      if (!summaryDoc.exists) {
        return {
          id: projectId,
          summaryHasCover: false,
          projectHasCover: !!projectCoverUrl,
          summaryCoverUrlPrefix: 'DOCUMENT_MISSING',
          projectCoverUrlPrefix: getUrlPrefix(projectCoverUrl),
        };
      }
      
      const summaryData = summaryDoc.data();
      const summaryCoverUrl = summaryData?.image?.imageUrl || summaryData?.coverMedia?.url || null;
      
      return {
        id: projectId,
        summaryHasCover: !!summaryCoverUrl,
        projectHasCover: !!projectCoverUrl,
        summaryCoverUrlPrefix: getUrlPrefix(summaryCoverUrl),
        projectCoverUrlPrefix: getUrlPrefix(projectCoverUrl),
      };
    });

    const samples = await Promise.all(auditPromises);

    return NextResponse.json({ ok: true, samples });
  } catch (error: any) {
    console.error('[portfolio-cover-audit] Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message, code: error.code },
      { status: 500 }
    );
  }
}
