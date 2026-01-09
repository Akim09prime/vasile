
'use client';
import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Terminal } from "lucide-react";
import { createProject, updateProject, deleteProject, getProjectsFromFirestore } from "@/lib/services/project-service";
import type { Project, ProjectData } from "@/lib/types";
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectForm } from './project-form';
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

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
    const { toast } = useToast();
    const { user, isAdmin, isPermissionLoading } = useAuth();

    const fetchProjects = useCallback(async () => {
        if (!isAdmin) {
            setError("You do not have permission to view this page.");
            setLoadingData(false);
            return;
        }

        setLoadingData(true);
        setError(null);

        try {
            // This now uses the client-side SDK, respecting Firestore rules for the authenticated admin user.
            const fetchedProjects = await getProjectsFromFirestore({ showUnpublished: true });
            setProjects(fetchedProjects);
        } catch (err: any) {
            console.error('[AdminProjectsPage] Fetch error:', err);
            setError(err.message || 'An unknown error occurred while fetching projects.');
        } finally {
            setLoadingData(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        // We wait until the permission check is complete and we know the user is an admin.
        if (!isPermissionLoading && user) {
            if (isAdmin) {
                fetchProjects();
            } else {
                 setError("You do not have administrative permissions to view projects.");
                 setLoadingData(false);
            }

        } else if (!isPermissionLoading && !user) {
            setError("Please log in to view projects.");
            setLoadingData(false);
        }
    }, [isPermissionLoading, user, isAdmin, fetchProjects]);


    const handleNewProject = () => {
      setEditingProject(null);
      setIsFormOpen(true);
    }
    
    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setIsFormOpen(true);
    };
    
    const openDeleteConfirm = (id: string) => {
        setDeletingItemId(id);
        setIsAlertOpen(true);
    };

    const handleDeleteProject = async () => {
        if (!deletingItemId) return;
        try {
            await deleteProject(deletingItemId);
            toast({ title: "Success", description: "Project has been deleted." });
            fetchProjects();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete project." });
        } finally {
            setIsAlertOpen(false);
            setDeletingItemId(null);
        }
    };
    
    const onProjectFormSubmit = async (data: ProjectData) => {
      try {
        if (editingProject) {
          await updateProject(editingProject.id, data);
          toast({ title: "Success", description: "Project has been updated." });
        } else {
          await createProject(data);
          toast({ title: "Success", description: "Project has been created." });
        }
        setIsFormOpen(false);
        fetchProjects();
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "An error occurred while saving the project." });
      }
    };
    
    const dynamicColumns = columns({ onEdit: handleEditProject, onDelete: openDeleteConfirm });
    
    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage portfolio projects.</p>
                </div>
                <Button onClick={handleNewProject}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                </Button>
            </div>

            {isPermissionLoading || (loadingData && projects.length === 0) ? (
                <div className="text-center">Loading projects...</div>
            ) : error ? (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Projects</AlertTitle>
                    <AlertDescription>
                        <p className="font-mono text-xs mb-4 break-all whitespace-pre-wrap">{error}</p>
                         <p className="mt-2 text-xs">This can happen if Firestore rules are not published or you do not have admin permissions.</p>
                        <Button onClick={fetchProjects} variant="secondary" className="mt-4">
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : (
                <DataTable key={projects.length} columns={dynamicColumns} data={projects} filterColumn='name' />
            )}
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                <DialogDescription>
                    {editingProject ? 'Modify the project details.' : 'Complete the details for the new project.'}
                </DialogDescription>
                </DialogHeader>
                <ProjectForm 
                    onSubmit={onProjectFormSubmit} 
                    project={editingProject} 
                    onClose={() => setIsFormOpen(false)}
                />
            </DialogContent>
            </Dialog>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The project will be permanently deleted from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProject}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
