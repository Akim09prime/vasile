
'use client';

import { db } from '@/lib/firebase';
import type { Project, ProjectData, ProjectType, ProjectSummary } from '@/lib/types';
import { PlaceHolderImages } from '../placeholder-images';
import type { ImagePlaceholder } from '../placeholder-images';
import { getSeedProjects } from './placeholder-db';
import { defaultProjectTypes } from '../defaults';
import { collection, getDocs, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, setDoc, Query as FirestoreQuery, Timestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const slugify = (text: string) => text.toString().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]+/g, '')
  .replace(/--+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '');


// --- PUBLIC FACING SERVER-SIDE FETCH ---
export async function getProjectsFromApi(): Promise<ProjectSummary[]> {
     // This function is intended to be called from Server Components.
     // It fetches data from our own API route.
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/public/portfolio`, {
        next: { revalidate: 300 } // Revalidate every 5 minutes
    });

    if (!res.ok) {
        // This will be caught by the nearest error boundary
        throw new Error(`Failed to fetch portfolio data. Status: ${res.status}`);
    }

    const data = await res.json();
    if (!data.ok) {
        throw new Error(data.error || 'API returned an error');
    }

    return data.items;
}


// --- CLIENT-SIDE FUNCTIONS (for Admin Panel) ---

/**
 * Fetches projects using the client-side SDK.
 * This function is intended to be called from client components where a user is authenticated.
 * Firestore security rules will be enforced based on the user's auth state.
 */
export async function getProjectsFromFirestore(params: { showUnpublished?: boolean } = {}): Promise<Project[]> {
    try {
        let q: FirestoreQuery = query(collection(db, 'projects'));
        if (!params.showUnpublished) {
             q = query(q, where('isPublished', '==', true));
        }
        
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }

        const projects = snapshot.docs.map(doc => {
            const data = doc.data();
            
            const createdAt = data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString();
            const publishedAt = data.publishedAt?.toDate?.()?.toISOString() || undefined;
            const completedAt = data.completedAt?.toDate?.()?.toISOString() || undefined;
            const coverImage = PlaceHolderImages.find(p => p.id === data.coverMediaId);

            return {
                id: doc.id,
                name: data.name,
                slug: data.slug,
                category: data.category,
                categorySlug: data.categorySlug,
                summary: data.summary,
                content: data.content,
                location: data.location,
                isPublished: data.isPublished,
                publishedAt: publishedAt,
                completedAt: completedAt,
                createdAt: createdAt,
                coverMediaId: data.coverMediaId,
                media: data.media || [],
                image: coverImage || null,
            } as Project;
        });
        
        projects.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });

        return projects;

    } catch (error: any) {
        if (error.code === 'permission-denied') {
             const permissionError = new FirestorePermissionError({
                path: 'projects',
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError; // re-throw for the component to catch
        }
        console.error('[ProjectService] Error fetching projects from Firestore (client SDK):', { code: error.code, message: error.message });
        throw new Error(`Failed to fetch projects. Firestore error code: ${error.code}`);
    }
}


/**
 * Fetches a single project by ID using the client SDK.
 * Respects security rules.
 */
export async function getProjectById(id: string): Promise<Project | null> {
    try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        const coverImage = PlaceHolderImages.find(p => p.id === data.coverMediaId);

        return {
            id: docSnap.id,
            name: data.name,
            slug: data.slug,
            category: data.category,
            categorySlug: data.categorySlug,
            summary: data.summary,
            content: data.content,
            location: data.location,
            isPublished: data.isPublished,
            publishedAt: data.publishedAt?.toDate?.().toISOString(),
            completedAt: data.completedAt?.toDate?.().toISOString(),
            createdAt: data.createdAt.toDate().toISOString(),
            coverMediaId: data.coverMediaId,
            media: data.media || [],
            image: coverImage || null,
        };
    } catch (error: any) {
        if (error.code === 'permission-denied') {
             const permissionError = new FirestorePermissionError({
                path: `projects/${id}`,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        }
        console.error(`[ProjectService] Error fetching project by ID ${id} (client SDK):`, error);
        throw new Error(`Failed to fetch project ${id}.`);
    }
}


export async function createProject(projectData: ProjectData): Promise<string> {
    const categorySlug = defaultProjectTypes.find((pt: any) => pt.label_ro === projectData.category)?.slug || 'uncategorized';
    const generatedSlug = slugify(projectData.name);

    const fullData: any = {
        ...projectData,
        media: projectData.media || [],
        slug: generatedSlug,
        categorySlug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: projectData.isPublished ? serverTimestamp() : null,
        completedAt: projectData.completedAt ? Timestamp.fromDate(new Date(projectData.completedAt)) : null,
    };
    
    const docRef = await addDoc(collection(db, 'projects'), fullData);
    await syncProjectSummary(docRef.id);
    
    return docRef.id;
}

export async function updateProject(id: string, projectData: Partial<ProjectData>): Promise<void> {
    const projectRef = doc(db, 'projects', id);
    const docSnap = await getDoc(projectRef);
    if (!docSnap.exists()) throw new Error("Project not found");

    const currentData = docSnap.data();
    const updatePayload: any = {
        ...projectData,
        media: projectData.media || [],
        slug: projectData.name ? slugify(projectData.name) : currentData.slug,
        updatedAt: serverTimestamp(),
    };

    if (projectData.category && projectData.category !== currentData.category) {
        updatePayload.categorySlug = defaultProjectTypes.find((pt: any) => pt.label_ro === projectData.category)?.slug || 'uncategorized';
    }

    if (projectData.isPublished === true && !currentData.isPublished) {
        updatePayload.publishedAt = serverTimestamp();
    } else if (projectData.isPublished === false && currentData.isPublished) {
        updatePayload.publishedAt = null;
    }

    if (projectData.completedAt) {
        updatePayload.completedAt = Timestamp.fromDate(new Date(projectData.completedAt));
    }
    
    await updateDoc(projectRef, updatePayload);
    await syncProjectSummary(id);
}

export async function deleteProject(id: string): Promise<void> {
    await deleteDoc(doc(db, 'projects', id));
    await deleteDoc(doc(db, 'project_summaries', id));
}

export async function seedDatabase(): Promise<void> {
    const projects = getSeedProjects();
    for (const project of projects) {
        const tempId = slugify(project.name);
        const docRef = doc(db, 'projects', tempId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
             await setDoc(docRef, { ...project, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), completedAt: serverTimestamp() });
             await syncProjectSummary(tempId);
        }
    }
}

export async function syncProjectSummary(projectId: string): Promise<void> {
    const projectRef = doc(db, "projects", projectId);
    const summaryRef = doc(db, "project_summaries", projectId);

    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) {
        await deleteDoc(summaryRef);
        console.log(`[Sync] Deleted summary for non-existent project ${projectId}`);
        return;
    }
    
    const projectData = projectSnap.data() as ProjectData;
    const coverImage = PlaceHolderImages.find(p => p.id === projectData.coverMediaId);
    const generatedSlug = projectData.slug || slugify(projectData.name);

    const summaryPayload = {
      name: projectData.name,
      slug: generatedSlug,
      category: projectData.category,
      categorySlug: defaultProjectTypes.find(pt => pt.label_ro === projectData.category)?.slug || 'uncategorized',
      summary: projectData.summary,
      location: projectData.location,
      isPublished: projectData.isPublished,
      publishedAt: projectSnap.data().publishedAt || null, // Keep it consistent
      completedAt: projectSnap.data().completedAt || null, // Copy completion date
      createdAt: projectSnap.data().createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      coverMediaId: projectData.coverMediaId,
      media: (projectData.media || []).map(m => ({ // Sanitize media array for summary
          id: m.id,
          imageUrl: m.imageUrl,
          description: m.description,
          imageHint: m.imageHint,
          rating: m.rating || 0,
          isTop: m.isTop || false,
      })),
      image: coverImage ? {
          id: coverImage.id,
          imageUrl: coverImage.imageUrl,
          description: coverImage.description,
          imageHint: coverImage.imageHint,
      } : null,
    };
    
    await setDoc(summaryRef, summaryPayload, { merge: true });
}
