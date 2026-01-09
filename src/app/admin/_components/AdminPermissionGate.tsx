'use client';

import { useAuth } from '@/hooks/use-auth';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AdminPermissionGate({ children }: { children: ReactNode }) {
    const { isAdmin, isPermissionLoading, authReady } = useAuth();
    
    // While checking auth state and admin permissions, show a loader.
    if (!authReady || isPermissionLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Verifying admin permissions...</p>
            </div>
        );
    }
    
    // Once checks are done, if the user is not an admin, show the access denied message.
    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
                <p className="mt-2 text-muted-foreground max-w-md">
                    Your account does not have administrative privileges. 
                    If you believe this is an error, please contact the site owner.
                </p>
                 <p className="mt-4 text-sm text-muted-foreground max-w-md">
                   If you are setting up the application for the first time, please complete the steps on the {' '}
                    <Link href="/admin/setup" className="underline hover:text-primary">Admin Setup page</Link>.
                </p>
            </div>
        );
    }

    // If user is an admin, render the protected content.
    return <>{children}</>;
}
