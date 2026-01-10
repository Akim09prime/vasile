import 'server-only';
import { NextResponse } from 'next/server';
import { getPublicProjects } from '@/lib/services/project-api-service';

export const revalidate = 300; // Revalidate at most every 5 minutes
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await getPublicProjects();
    return NextResponse.json({ ok: true, count: items.length, items });
  } catch (e: any) {
    console.error("[API/public/portfolio] GET Error:", e);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to fetch portfolio projects.",
        details: e.message,
      },
      { status: 500 }
    );
  }
}
