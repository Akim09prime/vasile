import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server-client";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { ProjectSummary, GalleryImage, ImagePlaceholder } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 300; // Revalidate every 5 minutes

const toISO = (value: any): string | null => {
  if (!value) return null;

  // already an ISO string
  if (typeof value === "string") return value;

  // Firestore Timestamp (client SDK)
  if (typeof value?.toDate === "function") {
    try {
      return value.toDate().toISOString();
    } catch {
      return null;
    }
  }

  // fallback for plain timestamp-like objects
  if (typeof value?.seconds === "number") {
    const ms =
      value.seconds * 1000 +
      Math.floor((typeof value.nanoseconds === "number" ? value.nanoseconds : 0) / 1e6);
    return new Date(ms).toISOString();
  }

  return null;
};

export async function GET() {
  const db = getServerDb();

  try {
    const q = query(collection(db, "project_summaries"), where("isPublished", "==", true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const topRatedImages: GalleryImage[] = [];

    snapshot.docs.forEach((docSnap) => {
      const project = docSnap.data() as ProjectSummary;

      // IMPORTANT: doc id lives on docSnap.id, not inside doc.data()
      const projectId = docSnap.id;
      const projectSlug = (project as any)?.slug ?? null;
      const projectName = (project as any)?.name ?? null;
      const category = (project as any)?.category ?? null;

      const publishedAtISO = toISO((project as any)?.publishedAt);

      const media = Array.isArray((project as any)?.media) ? ((project as any).media as ImagePlaceholder[]) : [];

      media.forEach((image: ImagePlaceholder) => {
        if (!image?.id) return;

        // An image is "top" if it has isTop: true OR rating: 5
        if (image.isTop === true || image.rating === 5) {
          const stablePrefix = projectId ?? projectSlug ?? "unknown";

          topRatedImages.push({
            id: `${stablePrefix}-${image.id}`, // FIX: never "undefined-..."
            projectId,
            projectSlug: projectSlug ?? undefined,
            projectName: projectName ?? undefined,
            category: category ?? undefined,
            publishedAt: publishedAtISO, // FIX: ISO string or null
            image: {
              id: image.id,
              imageUrl: image.imageUrl,
              description: image.description,
              imageHint: image.imageHint,
              rating: image.rating,
              isTop: image.isTop,
            },
          });
        }
      });
    });

    // Sort images by project publication date, newest first
    topRatedImages.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ ok: true, items: topRatedImages });
  } catch (error: any) {
    console.error("[API/public/gallery] Firestore Error:", {
      message: error?.message,
      code: error?.code,
    });

    return NextResponse.json(
      { ok: false, error: `Failed to fetch gallery: ${error?.message}`, code: error?.code },
      { status: 500 }
    );
  }
}
