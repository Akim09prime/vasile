'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigValid } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const StatusIcon = ({ status }: { status: boolean | null | undefined }) => {
    if (status === true) return <CheckCircle className="h-4 w-4 text-green-500 inline-block ml-2" />;
    if (status === false) return <XCircle className="h-4 w-4 text-red-500 inline-block ml-2" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500 inline-block ml-2" />;
}

type AdminDocState = {
    docExists: boolean | null;
    isAllowed: boolean | null;
    error: string | null;
    isLoading: boolean;
}

type PermissionDiagnosticProps = {
    adminCount?: number | null;
}

const ADMIN_COLLECTION_NAME = 'admins';

export default function AdminPermissionDiagnostic({ adminCount }: PermissionDiagnosticProps) {
    const { user, isAdmin, isPermissionLoading, permissionError } = useAuth();
    const { toast } = useToast();
    const [adminDocState, setAdminDocState] = useState<AdminDocState>({
        docExists: null,
        isAllowed: null,
        error: null,
        isLoading: true
    });

    const bootstrapKeyEnv = process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_KEY;
    const adminPath = user ? `/${ADMIN_COLLECTION_NAME}/${user.uid}` : 'N/A';

    useEffect(() => {
        if (!user || !isFirebaseConfigValid) {
            setAdminDocState({ isLoading: false, docExists: false, isAllowed: false, error: "User not logged in or Firebase not configured." });
            return;
        }

        const checkAdminDoc = async () => {
            setAdminDocState({ isLoading: true, docExists: null, isAllowed: null, error: null });
            try {
                const adminDocRef = doc(db, ADMIN_COLLECTION_NAME, user.uid);
                const docSnap = await getDoc(adminDocRef);
                if (docSnap.exists()) {
                    setAdminDocState({
                        isLoading: false,
                        docExists: true,
                        isAllowed: docSnap.data()?.allowed === true,
                        error: null,
                    });
                } else {
                    setAdminDocState({ isLoading: false, docExists: false, isAllowed: false, error: "Admin document does not exist for this UID." });
                }
            } catch (err: any) {
                setAdminDocState({ isLoading: false, docExists: false, isAllowed: false, error: `Firestore Read Error: ${err.code} - ${err.message}` });
            }
        };

        checkAdminDoc();
    }, [user, isAdmin]); // Rerun check if isAdmin changes

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: 'UID has been copied to clipboard.' });
    }
    
    return (
        <Card className="mt-8 bg-secondary/50 border-dashed">
            <CardHeader>
                <CardTitle>Admin Permission Diagnostics</CardTitle>
                <CardDescription>(Visible in Development Mode Only)</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2 font-mono text-xs">
                <div><strong>User:</strong> {user?.email || 'Not logged in'}</div>
                <div className="flex items-center gap-2">
                    <strong>UID:</strong> 
                    <span className="truncate">{user?.uid || 'N/A'}</span>
                    {user?.uid && <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(user.uid)}><Copy className="h-3 w-3" /></Button>}
                </div>
                <hr className="my-2 border-border/50"/>
                <div><strong>Bootstrap Mode:</strong> {bootstrapKeyEnv ? 'Enabled (Key is set)' : 'Disabled (Key is not set)'}</div>
                <div><strong>Admin Docs Count:</strong> {adminCount ?? 'loading...'}</div>
                <div><strong>Collection Checked:</strong> `{ADMIN_COLLECTION_NAME}`</div>
                <hr className="my-2 border-border/50"/>
                <div><strong>`useAuth` Hook State:</strong></div>
                <div className="pl-4">
                    <div>isPermissionLoading: {JSON.stringify(isPermissionLoading)}</div>
                    <div>isAdmin: {JSON.stringify(isAdmin)}</div>
                    <div>permissionError: {permissionError?.message || 'null'}</div>
                </div>
                <hr className="my-2 border-border/50"/>
                <div><strong>Direct Document Check:</strong></div>
                {adminDocState.isLoading ? (
                     <div className="pl-4">Checking admin document...</div>
                ) : (
                    <div className="pl-4">
                        <div>
                            <strong>Path:</strong> <code>{adminPath}</code>
                        </div>
                        <div>
                            <strong>Document Exists:</strong> {JSON.stringify(adminDocState.docExists)}
                            <StatusIcon status={adminDocState.docExists} />
                        </div>
                        <div>
                            <strong>`allowed` is `true`:</strong> {JSON.stringify(adminDocState.isAllowed)}
                            <StatusIcon status={adminDocState.isAllowed} />
                        </div>
                        {adminDocState.error && (
                             <Alert variant="destructive" className="mt-2 text-xs">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Direct Check Error</AlertTitle>
                                <AlertDescription>
                                    {adminDocState.error}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
