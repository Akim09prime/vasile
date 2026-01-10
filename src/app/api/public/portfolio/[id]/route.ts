
import { NextResponse } from 'next/server';
import { getProjectById } from '@/lib/services/project-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ ok: false, error: 'Project ID is required' }, { status: 400 });
    }

    try {
        const project = await getProjectById(id);

        if (!project) {
            return NextResponse.json({ ok: false, error: 'Project not found' }, { status: 404 });
        }
        
        return NextResponse.json({ ok: true, item: project });

    } catch (error: any) {
        console.error(`[API] Error fetching project ${id}:`, error);
        return NextResponse.json({ ok: false, error: error.message || 'Internal Server Error', code: error.code }, { status: 500 });
    }
}
