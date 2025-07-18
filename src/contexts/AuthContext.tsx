// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged, User, signOut, signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { app as firebaseApp } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        user.getIdToken().then((token) => {
            // Set cookie for server-side rendering/middleware
            document.cookie = `firebaseIdToken=${token}; path=/; max-age=3600`; // 1 hour expiration
        });
      } else {
         // Clear cookie on logout
         document.cookie = 'firebaseIdToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!isMounted || loading) return;

    const isPublicPage = ['/login'].includes(pathname);

    if (!user && !isPublicPage) {
      router.push('/login');
    }

    if (user && isPublicPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router, isMounted]);

  const login = async (email: string, pass: string) => {
    const auth = getAuth(firebaseApp);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({
          title: "Welcome Back!",
          description: "You have successfully signed in."
      });
      router.push('/');
    } catch (error) {
      console.error("Firebase Login Error: ", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      const errorCode = (error as AuthError).code;
      
      switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Could not connect to the authentication service. Please check your internet connection.";
          break;
        default:
          errorMessage = "Login failed. Please try again later.";
      }
      
      toast({
          title: "Login Failed",
          description: errorMessage,
          variant: 'destructive'
      });
      return error as AuthError;
    }
  };

  const logout = async () => {
    const auth = getAuth(firebaseApp);
    await signOut(auth);
    setUser(null);
    router.push('/login');
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    });
  };

  const value = { user, loading, logout, login };
  
  if (!isMounted || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading application...</p>
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
