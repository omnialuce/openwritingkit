// src/app/(app)/feedback/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, ExternalLink, Heart, Mail, Twitter } from 'lucide-react';
import { DonationDialog } from '@/components/layout/DonationDialog';


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
            <div className="grid md:grid-cols-2 gap-8">
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
