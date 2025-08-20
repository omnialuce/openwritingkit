
// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type AuthError 
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void | AuthError>;
  signup: (email: string, pass: string, inviteCode: string) => Promise<void>;
  changeUserEmail: (currentPass: string, newEmail: string) => Promise<{success: boolean, message: string}>;
  changeUserPassword: (currentPass: string, newPass: string) => Promise<{success: boolean, message: string}>;
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

    const isPublicPage = ['/login', '/signup'].includes(pathname);

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

  const signup = async (email: string, pass: string, inviteCode: string) => {
      const auth = getAuth(firebaseApp);
      const db = getFirestore(firebaseApp);

      // Placeholder for invite code validation
      if (!inviteCode || inviteCode.trim() === '') {
        toast({ title: t('signup.toast.missing_fields_title'), description: t('signup.toast.missing_fields_desc'), variant: 'destructive' });
        return;
      }
      
      try {
        // 1. Create User in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newUser = userCredential.user;
        
        toast({ title: t('signup.toast.signup_successful_title'), description: t('signup.toast.signup_successful_desc') });
        router.push('/login');

      } catch (error: any) {
         let message = t('auth.login_error_default');
         if (error.code === 'auth/email-already-in-use') {
            message = 'This email address is already in use by another account.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'The email address is not valid.';
        } else if (error.code === 'auth/weak-password' || error.code === 'auth/password-does-not-meet-requirements') {
            message = 'Password does not meet requirements. It must be at least 6 characters and include an uppercase letter and a non-alphanumeric character.';
        }
        console.error("Signup error:", error);
        toast({ title: t('signup.toast.signup_failed_title'), description: message, variant: 'destructive' });
      }
  };

  const changeUserEmail = async (currentPass: string, newEmailAddress: string) => {
    if (!user || !user.email) return { success: false, message: 'User not logged in.' };
    const auth = getAuth(firebaseApp);

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPass);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, newEmailAddress);
        return { success: true, message: 'Email updated successfully. Please log in again.' };
    } catch (error: any) {
        let message = 'An unexpected error occurred.';
        if (error.code === 'auth/invalid-credential') {
            message = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/email-already-in-use') {
            message = 'This email address is already in use by another account.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'The new email address is not valid.';
        }
        console.error("Email change error", error);
        return { success: false, message };
    }
  };

  const changeUserPassword = async (currentPass: string, newPass: string) => {
    if (!user || !user.email) return { success: false, message: 'User not logged in.' };

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPass);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPass);
        return { success: true, message: 'Password updated successfully. Please log in again.' };
    } catch (error: any) {
        let message = 'An unexpected error occurred.';
         if (error.code === 'auth/invalid-credential') {
            message = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/weak-password' || error.code === 'auth/password-does-not-meet-requirements') {
            message = 'The new password is too weak or does not meet complexity requirements.';
        }
        console.error("Password change error", error);
        return { success: false, message };
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

  const value = { user, loading, logout, login, signup, changeUserEmail, changeUserPassword };
  
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
