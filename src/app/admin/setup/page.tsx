
'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AdminPermissionDiagnostic from '../_components/PermissionDiagnostic';
import { createFirstAdmin, getAdminsCount } from '@/lib/services/admin-service';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

const bootstrapKeyEnv = process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_KEY;

const StatusIcon = ({ status, isLoading }: { status: boolean | null; isLoading?: boolean }) => {
    if (isLoading) return <Loader className="h-4 w-4 inline-block ml-2 animate-spin" />;
    if (status === true) return <CheckCircle className="h-4 w-4 text-green-500 inline-block ml-2" />;
    if (status === false) return <XCircle className="h-4 w-4 text-red-500 inline-block ml-2" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500 inline-block ml-2" />;
};

type TestResult = 
  | { ok: true; message: string; path: string; }
  | { ok: false; code: string; message: string; path: string; };

export default function AdminSetupPage() {
    const { user, authReady, isAdmin, isPermissionLoading, checkAdminStatus } = useAuth();
    const { toast } = useToast();
    
    const [bootstrapKey, setBootstrapKey] = React.useState('');
    const [isCreating, setIsCreating] = React.useState(false);

    const [adminCount, setAdminCount] = React.useState<number | null>(null);
    const [isCheckingCount, setIsCheckingCount] = React.useState(false);
    const [countError, setCountError] = React.useState<string | null>(null);

    const [testResult, setTestResult] = React.useState<TestResult | null>(null);
    const [isTesting, setIsTesting] = React.useState(false);

    const isBootstrapPossible = bootstrapKeyEnv && adminCount === 0;

    React.useEffect(() => {
        if (user) {
            setIsCheckingCount(true);
            getAdminsCount()
                .then((result) => {
                    if (result.ok) {
                        setAdminCount(result.count);
                    } else {
                        setAdminCount(-1);
                        setCountError(result.message);
                    }
                })
                .finally(() => setIsCheckingCount(false));
        }
    }, [user]);

    const handleCreateFirstAdmin = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }
        if (!bootstrapKey) {
            toast({ variant: 'destructive', title: 'Error', description: 'Bootstrap key is required.' });
            return;
        }
        if (bootstrapKey !== bootstrapKeyEnv) {
             toast({ variant: 'destructive', title: 'Error', description: 'The provided bootstrap key is incorrect.' });
            return;
        }

        setIsCreating(true);
        try {
            await createFirstAdmin(user.uid, user.email || 'N/A');
            toast({ title: 'Success', description: 'Admin document created successfully. Permissions will update shortly.' });
            await checkAdminStatus();
            setAdminCount(1);
        } catch (serverError: any) {
             toast({ variant: 'destructive', title: 'Error Creating Document', description: serverError.message });
        } finally {
            setIsCreating(false);
        }
    };
    
    const handleTestPermissions = async () => {
        if (!user) return;
        setIsTesting(true);
        setTestResult(null);

        // Proof of client-side execution
        console.log('---PERMISSION TEST---');
        console.log('Running environment:', typeof window !== 'undefined' ? 'Client' : 'Server');
        console.log('auth.currentUser?.uid:', auth.currentUser?.uid);
        console.log('---------------------');
        
        const testDocId = `test-${user.uid}-${Date.now()}`;
        const testDocRef = doc(db, 'adminTests', testDocId);
        const testData = { test: true, timestamp: serverTimestamp(), owner: user.uid };

        try {
            // Stage 1: Write
            await setDoc(testDocRef, testData);

            try {
                 // Stage 2: Delete
                await deleteDoc(testDocRef);
                setTestResult({ ok: true, message: 'Write/Delete permission test successful.', path: testDocRef.path });
            } catch (deleteError: any) {
                 setTestResult({ ok: false, code: deleteError.code || 'unknown', message: `Permission test failed at delete stage: ${deleteError.message}`, path: testDocRef.path });
            }
        } catch (writeError: any) {
             setTestResult({ ok: false, code: writeError.code || 'unknown', message: `Permission test failed at write stage: ${writeError.message}`, path: testDocRef.path });
        }
        
        setIsTesting(false);
    };

    if (!authReady) {
        return <div className="p-8">Loading authentication state...</div>;
    }
    
    if (!user) {
         return <div className="p-8">Please log in to access the setup page.</div>;
    }


    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Setup</h1>
                <p className="text-muted-foreground">Configure your account to have administrative privileges.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Bootstrap First Admin</CardTitle>
                    <CardDescription>
                       To create the first admin, a secret "Bootstrap Key" must be set as an environment variable and provided here. This is a one-time action.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!bootstrapKeyEnv ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Bootstrap Mode Disabled</AlertTitle>
                            <AlertDescription>
                                The `NEXT_PUBLIC_ADMIN_BOOTSTRAP_KEY` environment variable is not set. Please set it in your `.env` file and restart the server to enable first-admin creation.
                            </AlertDescription>
                        </Alert>
                    ) : isCheckingCount ? (
                         <div className="flex items-center text-sm text-muted-foreground"><Loader className="mr-2 h-4 w-4 animate-spin"/>Checking admin count...</div>
                    ) : adminCount !== 0 ? (
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Bootstrap Mode Inactive</AlertTitle>
                            <AlertDescription>
                                {adminCount === -1 
                                 ? `Could not determine admin count. Error: ${countError}`
                                 : 'Bootstrap mode is disabled because at least one admin user already exists. New admins can only be added by existing admins.'
                                }
                            </AlertDescription>
                        </Alert>
                    ) : (
                         <div className="space-y-4 p-4 border rounded-lg bg-card">
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Bootstrap mode is active. You can create the first admin account.</p>
                            <div className="grid gap-2">
                                <Label htmlFor="bootstrap-key">Bootstrap Key</Label>
                                <Input 
                                    id="bootstrap-key" 
                                    type="password"
                                    placeholder="Enter the secret key"
                                    value={bootstrapKey}
                                    onChange={(e) => setBootstrapKey(e.target.value)}
                                    disabled={isCreating}
                                />
                            </div>
                            <Button onClick={handleCreateFirstAdmin} disabled={isCreating || !bootstrapKey}>
                                {isCreating ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create First Admin'}
                            </Button>
                         </div>
                    )}
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        This process uses Firestore rules that only allow this operation if the `admins` collection is empty.
                    </p>
                </CardFooter>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Step 2: Test Permissions</CardTitle>
                    <CardDescription>
                       After becoming an admin, use this button to test if your permissions are working correctly. This will attempt to write and delete a document in a protected collection.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Button onClick={handleTestPermissions} disabled={isTesting || !isAdmin}>
                        {isTesting ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Testing...</> : 'Test Admin Permissions'}
                    </Button>
                    {testResult && (
                        <div className={`mt-4 text-sm p-3 rounded-md border ${testResult.ok ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                           <p className="font-semibold flex items-center">
                             Test Result: {testResult.ok ? 'Success' : 'Failed'}
                             <StatusIcon status={testResult.ok} />
                           </p>
                           <p className="mt-1 text-xs ">{testResult.message}</p>
                           {!testResult.ok && <p className="mt-1 text-xs font-mono">Code: {testResult.code}</p>}
                           <p className="mt-1 text-xs font-mono">Path: {testResult.path}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <AdminPermissionDiagnostic adminCount={adminCount} />
        </div>
    );
}
