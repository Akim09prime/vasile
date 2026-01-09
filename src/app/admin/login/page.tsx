
'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { isFirebaseConfigValid } from '@/lib/firebase';
import FirebaseDiagnosticsPanel from '../_components/FirebaseDiagnosticsPanel';

export default function AdminLoginPage() {
    const { login, user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (!loading && user) {
            router.push(searchParams.get('redirect') || '/admin');
        }
    }, [user, loading, router, searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!isFirebaseConfigValid) {
             const errorMessage = "Firebase is not configured correctly. Please check the diagnostics panel.";
             setError(errorMessage);
             toast({ variant: 'destructive', title: 'Configuration Error', description: errorMessage });
             setIsSubmitting(false);
             return;
        }

        try {
            await login(email, password);
            toast({ title: 'Login successful!' });
            router.push(searchParams.get('redirect') || '/admin');
        } catch (err: any) {
            console.error(err);
            let errorMessage = "An unknown error occurred.";
            if (err.code) {
                switch(err.code) {
                    case 'auth/invalid-credential':
                    case 'auth/wrong-password':
                    case 'auth/user-not-found':
                        errorMessage = "Invalid credentials. Please check your email and password.";
                        break;
                    case 'auth/api-key-not-valid':
                        errorMessage = `An error occurred: ${err.code}. Please ensure your Firebase config is correct.`;
                        break;
                    default:
                        errorMessage = `An error occurred: ${err.code}`;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            toast({ variant: 'destructive', title: 'Login Error', description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading || user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <p>Loading Authentication...</p>
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">CARVELLO - Admin</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the control panel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="admin@example.com" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <Button type="submit" className="w-full" disabled={isSubmitting || !isFirebaseConfigValid}>
                                {isSubmitting ? 'Logging in...' : 'Login'}
                            </Button>
                        </div>
                    </form>
                    <FirebaseDiagnosticsPanel />
                </CardContent>
            </Card>
        </div>
    );
}
