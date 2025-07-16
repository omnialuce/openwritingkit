// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // The sign-in process is now handled by the useAuth hook
      await login();
      // On successful login, the user will be redirected via the callbackUrl
      // so we don't need to push the router here.
      toast({ title: "Redirecting...", description: "Successfully initiated login with Google." });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Login Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
      setIsLoading(false); // Only set loading to false on error
    }
  };

  return (
    <div className="flex items-center justify-center">
       <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome to OpenWritingKit</CardTitle>
          <CardDescription>Sign in with your Google account to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
