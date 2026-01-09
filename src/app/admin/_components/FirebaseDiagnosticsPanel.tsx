
'use client';

import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { firebaseConfig } from '@/lib/firebase-config';
import { isFirebaseConfigValid, firebaseInitializationError } from '@/lib/firebase';
import { Terminal, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getApp } from 'firebase/app';

export default function FirebaseDiagnosticsPanel() {
    const { user } = useAuth();
    
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    if (!isFirebaseConfigValid) {
         return (
            <Alert variant="destructive" className="mt-4 text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Firebase Configuration Error</AlertTitle>
                <AlertDescription>
                    Firebase config is missing or invalid. Please set the <code>NEXT_PUBLIC_FIREBASE_*</code> environment variables in your <code>.env</code> file and restart the development server. The values should not be placeholders like 'your-project-id'.
                </AlertDescription>
            </Alert>
        );
    }

    if (firebaseInitializationError) {
        return (
            <Alert variant="destructive" className="mt-4 text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Firebase Initialization Error</AlertTitle>
                <AlertDescription>
                    {firebaseInitializationError.message}
                </AlertDescription>
            </Alert>
        );
    }
    
    // Safely get app instance
    let app;
    try {
        app = getApp();
    } catch (e) {
        // App not initialized, which is already handled above.
        return null;
    }


    const envProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const configProjectId = firebaseConfig.projectId;
    const appProjectId = app?.options?.projectId;
    const isMismatch = envProjectId !== configProjectId || envProjectId !== appProjectId;

    return (
        <div className="mt-4 space-y-4">
            <Alert className="text-xs">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Firebase Diagnostics (Dev Only)</AlertTitle>
                <AlertDescription className="font-mono break-all space-y-1">
                    <div><strong>Env Project ID:</strong> {envProjectId || 'Not set'}</div>
                    <div><strong>Config Project ID:</strong> {configProjectId || 'Not set'}</div>
                    <div><strong>App Name:</strong> {app?.name || 'N/A'}</div>
                    <div><strong>App Project ID:</strong> {appProjectId || 'N/A'}</div>
                    <hr className="border-border/50 my-1"/>
                     <div><strong>Auth User:</strong> {user?.email || 'None'}</div>
                     <div><strong>Auth UID:</strong> {user?.uid || 'None'}</div>
                </AlertDescription>
            </Alert>
            {isMismatch && (
                <Alert variant="destructive" className="text-xs">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Project ID Mismatch!</AlertTitle>
                    <AlertDescription>
                        The project ID from environment variables does not match the one in the initialized Firebase app. This can lead to permission errors. Please check your <code>.env</code> file and restart the server.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};
