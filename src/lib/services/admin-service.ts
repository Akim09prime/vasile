
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp, getCountFromServer, deleteDoc } from 'firebase/firestore';

export async function createFirstAdmin(uid: string, email: string): Promise<void> {
    const adminDocRef = doc(db, 'admins', uid);
    const data = {
        allowed: true,
        email: email,
        createdAt: serverTimestamp(),
        createdBy: 'bootstrap',
    };
    
    // This action is specifically designed to be called from the server or a trusted client
    // It relies on Firestore rules to only allow creation if the admins collection is empty.
    await setDoc(adminDocRef, data);
}

export async function getAdminsCount(): Promise<{ ok: true; count: number } | { ok: false; code: string; message: string; path: string; operation: 'list' }> {
    const adminsRef = collection(db, 'admins');
    try {
        const snapshot = await getCountFromServer(adminsRef);
        return { ok: true, count: snapshot.data().count };
    } catch (error: any) {
        return { 
            ok: false, 
            code: error.code || 'unknown', 
            message: error.message || 'Failed to get admin count',
            path: 'admins',
            operation: 'list'
        };
    }
}
