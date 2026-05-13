'use client';

import { useEffect } from 'react';
import { setOnQuotaExceeded } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export function StorageQuotaWatcher() {
  const { toast } = useToast();

  useEffect(() => {
    setOnQuotaExceeded(() => {
      toast({
        title: 'Storage full',
        description:
          'Your browser storage is full. Some changes may not have been saved. ' +
          'Export a backup and clear old data in Settings.',
        variant: 'destructive',
        duration: 10000,
      });
    });
    return () => setOnQuotaExceeded(() => {});
  }, [toast]);

  return null;
}
