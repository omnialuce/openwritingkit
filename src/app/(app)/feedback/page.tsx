// src/app/(app)/feedback/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Coffee, Send, MessageCircleQuestion } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FeedbackPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [feedbackType, setFeedbackType] = useState('general');
  const [page, setPage] = useState('general');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: t('feedback.toast.empty_title'),
        description: t('feedback.toast.empty_desc'),
        variant: "destructive",
      });
      return;
    }

    const subject = `OpenWritingKit Feedback: [${feedbackType}] on [${page}]`;
    const body = encodeURIComponent(message);
    const mailtoLink = `mailto:owk@omnialuce.tech?subject=${encodeURIComponent(subject)}&body=${body}`;

    window.location.href = mailtoLink;
    
    toast({
      title: t('feedback.toast.success_title'),
      description: t('feedback.toast.success_desc'),
    });
  };

  return (
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
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{t('feedback.form.title')}</CardTitle>
              <CardDescription>
                {t('feedback.form.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback-type">{t('feedback.form.type_label')}</Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger id="feedback-type">
                    <SelectValue placeholder={t('feedback.form.type_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t('feedback.form.types.general')}</SelectItem>
                    <SelectItem value="bug">{t('feedback.form.types.bug')}</SelectItem>
                    <SelectItem value="suggestion">{t('feedback.form.types.suggestion')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-context">{t('feedback.form.page_label')}</Label>
                <Select value={page} onValueChange={setPage}>
                  <SelectTrigger id="page-context">
                    <SelectValue placeholder={t('feedback.form.page_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t('feedback.form.pages.general')}</SelectItem>
                    <SelectItem value="dashboard">{t('nav.dashboard')}</SelectItem>
                    <SelectItem value="editor">{t('nav.editor')}</SelectItem>
                    <SelectItem value="documents">{t('nav.documents')}</SelectItem>
                    <SelectItem value="outline">{t('nav.outline')}</SelectItem>
                    <SelectItem value="characters">{t('nav.characters')}</SelectItem>
                    <SelectItem value="plot-tools">{t('nav.plot_tools')}</SelectItem>
                    <SelectItem value="ai-tools">{t('nav.ai_tools')}</SelectItem>
                    <SelectItem value="analytics">{t('nav.analytics')}</SelectItem>
                    <SelectItem value="settings">{t('nav.settings')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-message">{t('feedback.form.message_label')}</Label>
                <Textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('feedback.form.message_placeholder')}
                  rows={8}
                  required
                />
              </div>
            </CardContent>
            <CardContent>
               <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {t('feedback.form.submit_button')}
              </Button>
            </CardContent>
          </form>
        </Card>
        
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <MessageCircleQuestion className="h-8 w-8 text-primary" />
                        <CardTitle>{t('feedback.contact.title')}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                       {t('feedback.contact.description')}
                    </p>
                    <a href="mailto:owk@omnialuce.tech?subject=OpenWritingKit%20Support%20Request">
                        <Button variant="outline" className="w-full">{t('feedback.contact.button')}</Button>
                    </a>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <div className="flex items-center gap-3">
                    <Coffee className="h-8 w-8 text-primary" />
                    <CardTitle>{t('feedback.support.title')}</CardTitle>
                </div>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground mb-4">
                    {t('feedback.support.description')}
                </p>
                <Link href="https://ko-fi.com/luanaairs" target="_blank" rel="noopener noreferrer">
                    <Button variant="default" className="w-full">
                        {t('feedback.support.button')}
                    </Button>
                </Link>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
