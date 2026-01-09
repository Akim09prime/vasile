

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import type { ContactFormData, ContactMessage } from '@/lib/types';

export async function createContactMessage(formData: ContactFormData): Promise<string | null> {
    try {
        const docRef = await addDoc(collection(db, 'contactMessages'), {
            ...formData,
            isRead: false,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding contact message: ", error);
        return null;
    }
}


export async function getContactMessages(): Promise<ContactMessage[]> {
     try {
        const messagesRef = collection(db, 'contactMessages');
        const querySnapshot = await getDocs(messagesRef);
        
        const messages: ContactMessage[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message,
                isRead: data.isRead,
                createdAt: data.createdAt?.toDate().toISOString(),
            } as ContactMessage;
        });
        
        // Sort in code to avoid index requirements
        messages.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        });

        return messages;
    } catch (error: any) {
        console.error("Error fetching contact messages: ", error);
        throw error;
    }
}

export async function deleteContactMessage(id: string): Promise<void> {
    await deleteDoc(doc(db, 'contactMessages', id));
}

export async function updateContactMessageStatus(id: string, isRead: boolean): Promise<void> {
    const messageRef = doc(db, 'contactMessages', id);
    await updateDoc(messageRef, { isRead });
}
