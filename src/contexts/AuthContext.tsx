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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const auth = getAuth(firebaseApp);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({
          title: "Welcome Back!",
          description: "You have successfully signed in."
      });
      router.push('/dashboard');
    } catch (error) {
      console.error("Firebase Login Error: ", error);
      toast({
          title: "Login Failed",
          description: (error as AuthError).message || "Invalid credentials. Please try again.",
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
  
  const isPublicPage = ['/login'].includes(pathname);

  if (!isMounted || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading application...</p>
      </div>
    );
  }
  
  if (!user && !isPublicPage) {
     if (typeof window !== 'undefined') {
        router.push('/login');
     }
     return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Redirecting to login...</p>
      </div>
     );
  }
  
  if(user && isPublicPage) {
     if (typeof window !== 'undefined') {
        router.push('/dashboard');
     }
      return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">You are already logged in. Redirecting...</p>
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
