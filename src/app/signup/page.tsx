
// src/app/signup/page.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const { t } = useLanguage();
  const { signup } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !inviteCode) {
      toast({ title: t('signup.toast.missing_fields_title'), description: t('signup.toast.missing_fields_desc'), variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: t('signup.toast.password_mismatch_title'), description: t('signup.toast.password_mismatch_desc'), variant: "destructive" });
      return;
    }
    setIsLoading(true);
    await signup(email, password, inviteCode);
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <Image src="/logo.png" alt="OpenWritingKit Logo" width={64} height={64} className="mx-auto mb-4 rounded-lg" />
            <CardTitle className="text-2xl">{t('signup.title')}</CardTitle>
            <CardDescription>{t('signup.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('signup.email_label')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.email_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('signup.password_label')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
               <p className="text-xs text-muted-foreground">{t('signup.password_requirements')}</p>
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('signup.confirm_password_label')}</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="invite-code">{t('signup.invite_code_label')}</Label>
              <Input
                id="invite-code"
                type="text"
                placeholder={t('signup.invite_code_placeholder')}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('signup.sign_up_button')}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex-col space-y-4">
            <Separator />
            <p className="text-sm text-muted-foreground">
                {t('signup.already_have_account')}{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    {t('signup.sign_in_link')}
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
