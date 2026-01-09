
'use client';
import { useEffect, useState, useCallback } from 'react';
import { getContactMessages, deleteContactMessage, updateContactMessageStatus } from "@/lib/services/contact-service";
import type { ContactMessage } from "@/lib/types";
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function AdminContactMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
    const { toast } = useToast();
    const { user, authReady } = useAuth();

    const fetchMessages = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const fetchedMessages = await getContactMessages();
            setMessages(fetchedMessages);
        } catch (err: any) {
            console.error(err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if(authReady) {
            fetchMessages();
        }
    }, [authReady, fetchMessages]);
    
    const openDeleteConfirm = (id: string) => {
        setDeletingItemId(id);
        setIsAlertOpen(true);
    };

    const handleDeleteMessage = async () => {
        if (!deletingItemId) return;
        try {
            await deleteContactMessage(deletingItemId);
            toast({ title: "Success", description: "Message has been deleted." });
            fetchMessages();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete message." });
        } finally {
            setIsAlertOpen(false);
            setDeletingItemId(null);
        }
    };

    const handleStatusChange = async (id: string, isRead: boolean) => {
        try {
            await updateContactMessageStatus(id, isRead);
            toast({ title: "Success", description: "Message status has been updated." });
            fetchMessages();
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "Could not update message status." });
        }
    }
    
    const dynamicColumns = columns({ 
        onDelete: openDeleteConfirm,
        onStatusChange: handleStatusChange 
    });

    if (loading && authReady) {
        return <div className="p-8">Loading messages...</div>
    }

    if (error) {
         return (
            <div className="p-8">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Messages</AlertTitle>
                    <AlertDescription>
                        <p>{error.message}</p>
                        <Button onClick={fetchMessages} variant="secondary" className="mt-4">
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!authReady) {
        return <div className="p-8">Authenticating...</div>
    }


    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
                    <p className="text-muted-foreground">Manage messages from the contact form.</p>
                </div>
            </div>
            
            <DataTable key={messages.length} columns={dynamicColumns} data={messages} filterColumn='name' />

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. The message will be permanently deleted.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteMessage}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
