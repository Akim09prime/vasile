
import { NextResponse } from 'next/server';
import { getPublicProjects } from '@/lib/services/project-api-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Ensures the route is re-evaluated on each request

export async function GET() {
  try {
    const projects = await getPublicProjects();
    return NextResponse.json({ ok: true, items: projects });
  } catch (error: any) {
    console.error('[API /public/portfolio] Final catch block:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
