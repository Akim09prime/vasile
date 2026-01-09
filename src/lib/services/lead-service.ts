

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import type { Lead, LeadFormData } from '@/lib/types';


export async function createLead(leadData: LeadFormData): Promise<string | null> {
    try {
        const docRef = await addDoc(collection(db, 'leads'), {
            ...leadData,
            status: 'new',
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding document: ", error);
        return null;
    }
}

export async function getLeads(): Promise<Lead[]> {
    try {
        const leadsRef = collection(db, 'leads');
        const querySnapshot = await getDocs(leadsRef);
        
        const leads: Lead[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                city: data.city,
                projectType: data.projectType,
                budget: data.budget,
                message: data.message,
                status: data.status,
                createdAt: data.createdAt?.toDate().toISOString(),
            } as Lead;
        });

        // Sort in code to avoid index requirements
        leads.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });


        return leads;
    } catch (error: any) {
        console.error("Error fetching leads: ", error);
        throw error;
    }
}

export async function deleteLead(id: string): Promise<void> {
    await deleteDoc(doc(db, 'leads', id));
}

export async function updateLeadStatus(id: string, status: Lead['status']): Promise<void> {
    const leadRef = doc(db, 'leads', id);
    await updateDoc(leadRef, { status });
}
