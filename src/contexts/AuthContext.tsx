'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { cloudSync } from '@/lib/cloud-sync';
import { setCloudUserId } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageContext';

// AppUser exposes both `id` (Supabase native) and `uid` (Firebase-compatible
// alias) so existing call sites using user.uid keep working unchanged.
export interface AppUser {
  id: string;
  uid: string;
  email: string | null;
}

function toAppUser(u: User): AppUser {
  return { id: u.id, uid: u.id, email: u.email ?? null };
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, pass: string, inviteCode: string) => Promise<void>;
  changeUserEmail: (currentPass: string, newEmail: string) => Promise<{ success: boolean; message: string }>;
  changeUserPassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    let cancelled = false;

    // sessionStorage flag prevents the post-pull reload from looping.
    // It persists across window.location.reload() but not across tab close,
    // so users always get a fresh pull when they open a new tab after logout.
    const PULL_DONE_KEY = 'owk-cloud-pull-done';

    function maybePullAndReload(userId: string) {
      if (sessionStorage.getItem(PULL_DONE_KEY)) return;
      sessionStorage.setItem(PULL_DONE_KEY, '1');
      cloudSync.pullAll(userId)
        .then(() => { window.location.reload(); })
        .catch(() => { /* non-fatal */ });
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        const appUser = toAppUser(session.user);
        setCloudUserId(appUser.id);
        setUser(appUser);
        const hasLocalData = Array.from({ length: localStorage.length }, (_, i) =>
          localStorage.key(i),
        ).some((k) => k?.startsWith('openwritingkit-'));
        if (!hasLocalData) maybePullAndReload(appUser.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const appUser = toAppUser(session.user);
        setCloudUserId(appUser.id);
        setUser(appUser);
        if (event === 'SIGNED_IN') {
          const hasLocalData = Array.from({ length: localStorage.length }, (_, i) =>
            localStorage.key(i),
          ).some((k) => k?.startsWith('openwritingkit-'));
          if (!hasLocalData) maybePullAndReload(appUser.id);
        }
      } else {
        setCloudUserId(null);
        setUser(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublicPage = ['/login', '/signup'].includes(pathname);
    if (!user && !isPublicPage) router.push('/login');
    if (user && isPublicPage) router.push('/');
  }, [user, loading, pathname, router]);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      const msg = error.message.toLowerCase().includes('invalid')
        ? t('auth.login_error_invalid_credential')
        : error.message;
      toast({ title: t('auth.login_failed_title'), description: msg, variant: 'destructive' });
      return;
    }
    toast({ title: t('auth.login_success_title'), description: t('auth.login_success_desc') });
    router.push('/');
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      toast({ title: t('auth.login_failed_title'), description: error.message, variant: 'destructive' });
    }
  };

  const signup = async (email: string, pass: string, inviteCode: string) => {
    // Server-side invite validation
    try {
      const res = await fetch('/api/validate-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });
      if (!res.ok) {
        toast({
          title: t('signup.toast.missing_fields_title'),
          description: t('signup.toast.missing_fields_desc'),
          variant: 'destructive',
        });
        return;
      }
    } catch {
      toast({
        title: t('signup.toast.signup_failed_title'),
        description: t('auth.login_error_network'),
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) {
      toast({
        title: t('signup.toast.signup_failed_title'),
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: t('signup.toast.signup_successful_title'),
      description: t('signup.toast.signup_successful_desc'),
    });
    router.push('/login');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCloudUserId(null);
    setUser(null);
    sessionStorage.removeItem('owk-cloud-pull-done');
    router.push('/login');
    toast({ title: t('auth.logout_success_title'), description: t('auth.logout_success_desc') });
  };

  const changeUserEmail = async (currentPass: string, newEmail: string) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: currentPass,
    });
    if (signInError) return { success: false, message: 'Current password is incorrect.' };
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Confirmation email sent. Check your inbox to complete the change.' };
  };

  const changeUserPassword = async (currentPass: string, newPass: string) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: currentPass,
    });
    if (signInError) return { success: false, message: 'Current password is incorrect.' };
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Password updated successfully.' };
  };

  const value = {
    user,
    loading,
    logout,
    login,
    loginWithGoogle,
    signup,
    changeUserEmail,
    changeUserPassword,
  };

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
