// src/app/(app)/feedback/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, ExternalLink, Heart } from 'lucide-react';
import Link from 'next/link';
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

        <div className="grid md:grid-cols-2 gap-8">
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
                        <Button className="w-full">
                            {t('feedback.votehub.button')}
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </a>
                </CardContent>
            </Card>
          
          <div className="space-y-8">
              <Card>
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
                  <Button onClick={() => setIsDonationDialogOpen(true)} variant="default" className="w-full">
                      {t('feedback.support.button')}
                  </Button>
                  </CardContent>
              </Card>
          </div>
        </div>
      </div>
      <DonationDialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen} />
    </>
  );
}
