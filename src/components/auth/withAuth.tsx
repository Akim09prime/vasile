
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const { user, loading, authReady } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isLoginPage = pathname === '/admin/login';
    const isLoading = loading || !authReady;

    useEffect(() => {
      if (isLoading) {
        return; // Don't do anything until loading is finished.
      }
      
      // If user is not logged in and not on the login page, redirect them.
      if (!user && !isLoginPage) {
        const redirectUrl = pathname !== '/admin' ? `?redirect=${pathname}` : '';
        router.push(`/admin/login${redirectUrl}`);
        return;
      }
      
      // If user is logged in and on the login page, redirect to dashboard.
      if (user && isLoginPage) {
        router.push('/admin');
        return;
      }

    }, [user, isLoading, pathname, router, isLoginPage]);

    // While loading, show a generic loading screen.
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Verifying authentication...</p>
        </div>
      );
    }
    
    // If the logic above is running, it will handle redirects.
    // We can render the component if we are on the right page.
    if ((isLoginPage && !user) || (!isLoginPage && user)) {
        return <WrappedComponent {...props} />;
    }

    // This state is hit during redirects or when auth state is changing.
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Redirecting...</p>
        </div>
    );
  };
  
  AuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withAuth;
