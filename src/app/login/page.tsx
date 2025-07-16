// src/app/login/page.tsx
'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { signIn } from 'next-auth/react';

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // The sign-in process is now handled by next-auth's signIn function
      // It will automatically redirect to Google and then to the callbackUrl on success.
      await signIn('google', { callbackUrl: '/dashboard' });
      // The page will redirect, so we don't need to do anything here.
      // isLoading will stay true until the redirect happens.
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Login Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
      setIsLoading(false); // Only set loading to false on a client-side catch
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen -m-8 bg-muted">
       <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <Link href="/" className="mb-4">
                <Image src="/logo.png" alt="OpenWritingKit Logo" width={48} height={48} className="mx-auto rounded-lg" />
            </Link>
          <CardTitle>Welcome to OpenWritingKit</CardTitle>
          <CardDescription>Sign in with your Google account to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>
                        {error === 'OAuthAccountNotLinked' 
                            ? 'This email is already associated with another provider.'
                            : 'An error occurred during authentication. Please try again.'}
                    </AlertDescription>
                </Alert>
            )}
           <Button onClick={handleGoogleLogin} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Image src="/google-logo.svg" alt="Google logo" width={16} height={16} className="mr-2" />
              )}
              Sign in with Google
            </Button>
        </CardContent>
         <CardContent className="text-center text-sm text-muted-foreground">
             <Link href="/" className="hover:text-primary underline">
                Back to Home
            </Link>
         </CardContent>
      </Card>
    </div>
  );
}

// Wrap LoginPage with a Suspense boundary
export default function LoginPageWithSuspense() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginPage />
    </React.Suspense>
  );
}