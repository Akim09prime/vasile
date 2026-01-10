

import { NextResponse } from 'next/server';
import { getPublicProjectBySlug } from '@/lib/services/project-api-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
    const { slug } = params;

    if (!slug) {
        return NextResponse.json({ ok: false, error: 'Slug is required' }, { status: 400 });
    }

    try {
        const item = await getPublicProjectBySlug(slug);

        if (!item) {
            return NextResponse.json({ ok: false, error: 'Project not found or not published' }, { status: 404 });
        }

        return NextResponse.json({ ok: true, item });

    } catch (error: any) {
        console.error(`[API/portfolio/slug] Error fetching project for slug "${slug}":`, error);
        return NextResponse.json({ ok: false, error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}
