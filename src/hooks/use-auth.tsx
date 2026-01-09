
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigValid } from '@/lib/firebase';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authReady: boolean;
  isAdmin: boolean | null;
  isPermissionLoading: boolean;
  permissionError: Error | null;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authReady: false,
  isAdmin: null,
  isPermissionLoading: true,
  permissionError: null,
  login: async () => {},
  logout: async () => {},
  checkAdminStatus: async () => {},
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isPermissionLoading, setIsPermissionLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<Error | null>(null);
  const { toast } = useToast();

  const checkAdminStatus = useCallback(async (currentUser?: User | null) => {
      const targetUser = currentUser === undefined ? user : currentUser;

      if (!targetUser || !isFirebaseConfigValid) {
          setIsAdmin(false);
          setIsPermissionLoading(false);
          return;
      }

      setIsPermissionLoading(true);
      setPermissionError(null);

      try {
          const adminDocRef = doc(db, "admins", targetUser.uid);
          const docSnap = await getDoc(adminDocRef);
          
          if (docSnap.exists() && docSnap.data().allowed === true) {
              setIsAdmin(true);
          } else {
              setIsAdmin(false);
              // We don't set an error here for non-admins, it's a normal state.
              // We only set it if the check itself fails.
          }
      } catch (error: any) {
          // This error is important for debugging rules for logged-in users
          console.error("Error checking admin status:", error);
          setPermissionError(error);
          setIsAdmin(false);
      } finally {
          setIsPermissionLoading(false);
      }
  }, [user]);

  useEffect(() => {
    // This runs once on mount
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setAuthReady(true);
      if(currentUser){
        // When user is loaded, check their admin status once.
        checkAdminStatus(currentUser);
      } else {
        // If no user, they are definitely not an admin.
        setIsAdmin(false);
        setIsPermissionLoading(false);
      }
    });

    return () => unsubscribeAuth();
    // checkAdminStatus is memoized and doesn't need to be in the dependency array
    // if we only want this to run on auth state change.
  }, [checkAdminStatus]);

  const login = async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Reset all user-specific state on logout
      setUser(null);
      setIsAdmin(null);
      setPermissionError(null);
      toast({ title: 'Deconectat cu succes.' });
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ variant: 'destructive', title: 'Eroare la deconectare' });
    }
  };
  
  // This is a manual trigger for components that might need to re-check permissions.
  const wrappedCheckAdminStatus = useCallback(async () => {
    await checkAdminStatus();
  }, [checkAdminStatus]);


  return (
    <AuthContext.Provider value={{ user, loading, authReady, isAdmin, isPermissionLoading, permissionError, login, logout, checkAdminStatus: wrappedCheckAdminStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
