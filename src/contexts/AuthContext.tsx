// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged, User, signOut, signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { app as firebaseApp } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void | AuthError>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        user.getIdToken().then((token) => {
            document.cookie = `firebaseIdToken=${token}; path=/; max-age=3600`;
        });
      } else {
         document.cookie = 'firebaseIdToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (loading) return;

    const isPublicPage = ['/login'].includes(pathname);

    if (!user && !isPublicPage) {
      router.push('/login');
    }

    if (user && isPublicPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, pass: string) => {
    const auth = getAuth(firebaseApp);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({
          title: t('auth.login_success_title'),
          description: t('auth.login_success_desc')
      });
      router.push('/');
    } catch (error) {
      console.error("Firebase Login Error: ", error);
      let errorMessage = t('auth.login_error_default');
      const errorCode = (error as AuthError).code;
      
      switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = t('auth.login_error_invalid_credential');
          break;
        case 'auth/too-many-requests':
          errorMessage = t('auth.login_error_too_many_requests');
          break;
        case 'auth/network-request-failed':
          errorMessage = t('auth.login_error_network');
          break;
      }
      
      toast({
          title: t('auth.login_failed_title'),
          description: errorMessage,
          variant: 'destructive'
      });
      return error as AuthError;
    }
  };

  const logout = async () => {
    const auth = getAuth(firebaseApp);
    await signOut(auth);
    // Explicitly clear the user state and the cookie
    setUser(null);
    document.cookie = 'firebaseIdToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
    toast({
        title: t('auth.logout_success_title'),
        description: t('auth.logout_success_desc')
    });
  };

  const value = { user, loading, logout, login };
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('auth.loading')}</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
