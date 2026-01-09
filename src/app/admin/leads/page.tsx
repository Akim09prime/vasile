
'use client';
import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { getLeads, deleteLead, updateLeadStatus } from "@/lib/services/lead-service";
import type { Lead } from "@/lib/types";
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


export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
    const { toast } = useToast();
    const { user, authReady } = useAuth();

    const fetchLeads = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const fetchedLeads = await getLeads();
            setLeads(fetchedLeads);
        } catch (err: any) {
            console.error(err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (authReady) {
            fetchLeads();
        }
    }, [authReady, fetchLeads]);
    
    const openDeleteConfirm = (id: string) => {
        setDeletingItemId(id);
        setIsAlertOpen(true);
    };

    const handleDeleteLead = async () => {
        if (!deletingItemId) return;
        try {
            await deleteLead(deletingItemId);
            toast({ title: "Success", description: "Lead has been deleted." });
            fetchLeads();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete lead." });
        } finally {
            setIsAlertOpen(false);
            setDeletingItemId(null);
        }
    };

    const handleStatusChange = async (id: string, status: Lead['status']) => {
        try {
            await updateLeadStatus(id, status);
            toast({ title: "Success", description: "Lead status has been updated." });
            fetchLeads();
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "Could not update lead status." });
        }
    }
    
    const dynamicColumns = columns({ 
        onDelete: openDeleteConfirm,
        onStatusChange: handleStatusChange 
    });

    if (loading && authReady) {
        return <div className="p-8">Loading leads...</div>
    }

    if (error) {
         return (
            <div className="p-8">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Leads</AlertTitle>
                    <AlertDescription>
                        <p>{error.message}</p>
                        <Button onClick={fetchLeads} variant="secondary" className="mt-4">
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
                    <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
                    <p className="text-muted-foreground">Manage quote requests.</p>
                </div>
            </div>
            
            <DataTable key={leads.length} columns={dynamicColumns} data={leads} filterColumn='name' />

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. The lead will be permanently deleted.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteLead}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
