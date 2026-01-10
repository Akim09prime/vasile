
import { NextResponse, type NextRequest } from "next/server";
import { getProjectBySlug } from '@/lib/services/project-api-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const slug = params.id; // The parameter is named 'id' due to the file name '[id].ts'

    if (!slug) {
        return NextResponse.json({ ok: false, error: "Project slug/id is required." }, { status: 400 });
    }

    try {
        // We use the same server-side service function here for consistency
        const project = await getProjectBySlug(slug);

        if (!project) {
             return NextResponse.json({
                ok: false,
                error: `Project with slug '${slug}' not found.`,
            }, { status: 404 });
        }
        
        return NextResponse.json({
            ok: true,
            item: project
        });

    } catch (error: any) {
        console.error(`[API] Error in portfolio detail for slug ${slug}:`, error);
        return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
    }
}
