import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin.server';
import { getDoc, doc } from 'firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Note: This API route is not currently used by the admin UI,
// which performs client-side operations directly. It's kept for potential future use.
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { db } = getAdminDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: 'Admin DB not initialized.' }, { status: 500 });
  }

  try {
    const docRef = doc(db, 'projects', params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ ok: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item: { id: docSnap.id, ...docSnap.data() } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
