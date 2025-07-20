// src/components/analytics/DeadlineCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Edit3, Save, Trash2 } from 'lucide-react';
import { format, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { useStoryContext, getDeadlineKey } from '@/contexts/StoryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function DeadlineCard() {
  const { t } = useLanguage();
  const { activeStoryId } = useStoryContext();
  const { user } = useAuth();
  const { toast } = useToast();

  const deadlineStorageKey = getDeadlineKey(activeStoryId, user?.uid);

  const [deadline, setDeadline] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (deadlineStorageKey) {
      const savedDeadline = localStorage.getItem(deadlineStorageKey);
      if (savedDeadline) {
        setDeadline(new Date(savedDeadline));
      } else {
        setDeadline(null);
      }
    } else {
      setDeadline(null);
    }
  }, [deadlineStorageKey]);

  useEffect(() => {
    const updateCountdown = () => {
      if (!deadline) {
        setCountdown('');
        return;
      }
      const now = new Date();
      if (now > deadline) {
        setCountdown(t('word_goal.deadline_passed'));
        return;
      }

      const days = differenceInDays(deadline, now);
      const hours = differenceInHours(deadline, now) % 24;
      const minutes = differenceInMinutes(deadline, now) % 60;

      let parts = [];
      if (days > 0) parts.push(`${days} ${days === 1 ? t('word_goal.day') : t('word_goal.days')}`);
      if (hours > 0) parts.push(`${hours} ${hours === 1 ? t('word_goal.hour') : t('word_goal.hours')}`);
      if (days === 0 && hours > 0 && minutes > 0) parts.push(`${minutes} ${minutes === 1 ? t('word_goal.minute') : t('word_goal.minutes')}`);
      if (days === 0 && hours === 0 && minutes > 0) parts.push(`${minutes} ${minutes === 1 ? t('word_goal.minute') : t('word_goal.minutes')}`);


      setCountdown(parts.join(', '));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline, t]);

  const handleSetDeadline = (date?: Date) => {
    if (!deadlineStorageKey) return;
    if (date) {
        setDeadline(date);
        localStorage.setItem(deadlineStorageKey, date.toISOString());
        toast({ title: t('word_goal.toast.deadline_set_title'), description: `${t('word_goal.toast.deadline_set_desc')} ${format(date, 'PPP')}.` });
    }
  };

  const handleRemoveDeadline = () => {
    if (!deadlineStorageKey) return;
    setDeadline(null);
    localStorage.removeItem(deadlineStorageKey);
    toast({ title: t('word_goal.toast.deadline_removed_title') });
  };
  
  if (!isMounted || !activeStoryId) {
    return null; // Don't render if not mounted or no active story
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-primary" />
                <CardTitle>{t('word_goal.deadline_title')}</CardTitle>
            </div>
            {deadline && (
                <Button variant="ghost" size="icon" onClick={handleRemoveDeadline} title={t('word_goal.remove_deadline_button')}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
            )}
        </div>
        <CardDescription>{t('word_goal.deadline_description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {deadline ? (
            <div className='text-center'>
                <p className="text-sm text-muted-foreground">{t('word_goal.deadline_date')}: {format(deadline, 'PPP')}</p>
                <p className="text-2xl font-bold text-primary mt-1">{countdown}</p>
            </div>
        ) : (
             <p className="text-sm text-muted-foreground text-center">{t('word_goal.no_deadline_set')}</p>
        )}
      </CardContent>
       <CardFooter>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Edit3 className="mr-2 h-4 w-4" />
                    {deadline ? t('word_goal.edit_deadline_button') : t('word_goal.set_deadline_button')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
            <Calendar
                mode="single"
                selected={deadline || undefined}
                onSelect={handleSetDeadline}
                initialFocus
                disabled={(date) => date < new Date()}
            />
            </PopoverContent>
        </Popover>
       </CardFooter>
    </Card>
  );
}
