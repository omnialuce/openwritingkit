// src/app/(app)/feedback/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, ExternalLink, Heart, Mail, Twitter } from 'lucide-react';
import { DonationDialog } from '@/components/layout/DonationDialog';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.04 2.02c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91z" stroke="none" />
      <path d="M16.49 13.48c-.28-.14-1.63-.8-1.89-.9-.26-.09-.45-.14-.64.14-.19.28-.71.9-.88 1.08-.16.19-.32.21-.6.07s-1.25-.46-2.38-1.47c-.88-.79-1.48-1.76-1.65-2.05-.17-.28 0-.44.13-.57.12-.12.26-.28.39-.42.13-.14.17-.25.26-.42.09-.17.04-.31-.02-.45-.07-.14-.64-1.54-.88-2.11-.23-.57-.47-.49-.64-.5-.17-.01-.36-.01-.54-.01-.19 0-.48.07-.73.35-.25.28-.97.95-1.17 2.3.2 1.35.99 2.64 1.13 2.82.14.19 1.99 3.2 4.83 4.56 2.84 1.36 2.84.91 3.36.85.52-.06 1.63-.67 1.86-1.3.23-.63.23-1.16.16-1.3-.07-.13-.26-.21-.54-.35z" fill="var(--background)" stroke="none"/>
    </svg>
  );


export default function FeedbackPage() {
  const { t } = useLanguage();
  const [isDonationDialogOpen, setIsDonationDialogOpen] = React.useState(false);


  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <MessageSquare className="mr-3 h-8 w-8 text-primary" />
            {t('feedback.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('feedback.description')}
          </p>
        </div>

        <Card>
          <CardHeader>
              <CardTitle>{t('feedback.votehub.title')}</CardTitle>
              <CardDescription>
                  {t('feedback.votehub.description')}
              </CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                  {t('feedback.votehub.subdescription')}
              </p>
              <a href="https://votehub.app/openwritingkit" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full md:w-auto">
                      {t('feedback.votehub.button')}
                      <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
              </a>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">{t('feedback.other_options.title')}</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <Card>
                    <CardHeader>
                         <div className="flex items-center gap-3">
                            <Mail className="h-8 w-8 text-primary" />
                            <CardTitle>{t('feedback.other_options.email_title')}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                          {t('feedback.other_options.email_desc')}
                        </p>
                        <a href="mailto:owk@omnialuce.tech?subject=OpenWritingKit%20Feedback">
                            <Button variant="outline" className="w-full">{t('feedback.other_options.email_button')}</Button>
                        </a>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <div className="flex items-center gap-3">
                            <Twitter className="h-8 w-8 text-primary" />
                            <CardTitle>{t('feedback.other_options.twitter_title')}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                          {t('feedback.other_options.twitter_desc')}
                        </p>
                        <a href="https://twitter.com/omnialucetech" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="w-full">{t('feedback.other_options.twitter_button')}</Button>
                        </a>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <div className="flex items-center gap-3">
                            <WhatsAppIcon className="h-8 w-8 text-primary" />
                            <CardTitle>WhatsApp Community</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Join our WhatsApp community for discussions, help, and announcements.
                        </p>
                        <a href="https://chat.whatsapp.com/KwKBMmCLI0d3ZX2xt2vEHs" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="w-full">Join Community</Button>
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
          
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
            <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-primary" />
                <CardTitle>{t('feedback.support.title')}</CardTitle>
            </div>
            </CardHeader>
            <CardContent>
            <p className="text-muted-foreground mb-4">
                {t('feedback.support.description')}
            </p>
            <Button onClick={() => setIsDonationDialogOpen(true)} variant="default" className="w-full md:w-auto">
                {t('feedback.support.button')}
            </Button>
            </CardContent>
        </Card>
      </div>
      <DonationDialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen} />
    </>
  );
}
