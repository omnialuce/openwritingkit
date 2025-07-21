// src/components/layout/DonationDialog.tsx
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { Coffee, Heart } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '../ui/separator';

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonationDialog({ open, onOpenChange }: DonationDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-7 w-7 text-primary" />
            <DialogTitle className="text-2xl">{t('donation.title')}</DialogTitle>
          </div>
          <DialogDescription>{t('donation.description')}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mt-2">
            <div className="px-6 pb-6 space-y-4">
                <p className="text-sm text-muted-foreground">{t('donation.sub_description')}</p>
                
                <Separator />
                
                <div>
                    <h4 className="font-semibold mb-2">{t('donation.pix.title')}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{t('donation.pix.description')}</p>
                    <div className="p-3 bg-secondary rounded-md text-center">
                        <p className="font-mono text-sm break-all">owk@omnialuce.tech</p>
                    </div>
                </div>

                <Separator />
                
                <div>
                    <h4 className="font-semibold mb-2">{t('donation.kofi.title')}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{t('donation.kofi.description')}</p>
                     <Link href="https://ko-fi.com/luanaairs" target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="default" className="w-full">
                            <Coffee className="mr-2 h-4 w-4" />
                            {t('donation.kofi.button')}
                        </Button>
                    </Link>
                </div>
            </div>
        </ScrollArea>
        <DialogFooter className="p-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">{t('common.close')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
