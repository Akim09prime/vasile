
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigValid } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

export default function AdminPermissionDiagnostic() {
    const { user } = useAuth();
    const [adminDocState, setAdminDocState] = useState<AdminDocState>({
        docExists: null,
        isAllowed: null,
        error: null,
        isLoading: true
    });

    useEffect(() => {
        if (!user || !isFirebaseConfigValid) {
            setAdminDocState({ isLoading: false, docExists: false, isAllowed: false, error: "User not logged in or Firebase not configured." });
            return;
        }

        const checkAdminDoc = async () => {
            setAdminDocState({ isLoading: true, docExists: null, isAllowed: null, error: null });
            try {
                const adminDocRef = doc(db, 'admins', user.uid);
                const docSnap = await getDoc(adminDocRef);
                if (docSnap.exists()) {
                    setAdminDocState({
                        isLoading: false,
                        docExists: true,
                        isAllowed: docSnap.data()?.allowed === true,
                        error: null,
                    });
                } else {
                    setAdminDocState({ isLoading: false, docExists: false, isAllowed: false, error: "Admin document does not exist." });
                }
            } catch (err: any) {
                setAdminDocState({ isLoading: false, docExists: false, isAllowed: false, error: `Firestore Read Error: ${err.code} - ${err.message}` });
            }
        };

        checkAdminDoc();
    }, [user]);

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }
    
    return (
        <Card className="mt-8 bg-secondary/50 border-dashed">
            <CardHeader>
                <CardTitle>Admin Permission Diagnostics</CardTitle>
                <CardDescription>(Visible in Development Mode Only)</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <div><strong>User Email:</strong> {user?.email || 'Not logged in'}</div>
                <div><strong>User UID:</strong> {user?.uid || 'N/A'}</div>
                <hr className="my-2"/>
                {adminDocState.isLoading ? (
                     <div>Checking admin document in Firestore...</div>
                ) : (
                    <>
                        <div>
                            <strong>Admin Document Check:</strong> 
                            <span className={adminDocState.error ? 'text-red-500' : 'text-green-500'}>
                                {adminDocState.error ? 'Failed' : 'Success'}
                            </span>
                        </div>
                        <div>
                            <strong>Path:</strong> <code>/admins/{user?.uid || '{UID}'}</code>
                        </div>
                        <div>
                            <strong>Document Exists:</strong> {JSON.stringify(adminDocState.docExists)}
                            <StatusIcon status={adminDocState.docExists} />
                        </div>
                        <div>
                            <strong>`allowed` field is `true`:</strong> {JSON.stringify(adminDocState.isAllowed)}
                            <StatusIcon status={adminDocState.isAllowed} />
                        </div>
                        {adminDocState.error && (
                             <Alert variant="destructive" className="mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error Details</AlertTitle>
                                <AlertDescription>
                                    {adminDocState.error}
                                </AlertDescription>
                            </Alert>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
