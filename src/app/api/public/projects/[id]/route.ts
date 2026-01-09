
import { NextResponse } from 'next/server';
import { doc, getDoc } from "firebase/firestore";
import { getServerDb } from "@/lib/firebase-server-client";
import type { Project } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    if (!id) {
        return NextResponse.json({ ok: false, error: "Project ID is required" }, { status: 400 });
    }

    try {
        const db = getServerDb();
        // Read from the public, summarized collection for security and performance
        const docRef = doc(db, "project_summaries", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data()?.isPublished === false) {
            return NextResponse.json({ ok: false, error: 'Project not found or not published' }, { status: 404 });
        }
        
        const project = docSnap.data() as Project;
        return NextResponse.json({ ok: true, project: { ...project, id: docSnap.id } });

    } catch (error: any) {
        console.error(`[API/public/projects] Error fetching project ${id}:`, error);
        return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
    }
}
