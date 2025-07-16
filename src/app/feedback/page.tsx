// src/app/feedback/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Lightbulb, Coffee, Send } from 'lucide-react';
import Link from 'next/link';

export default function FeedbackPage() {
  const { toast } = useToast();
  const [feedbackType, setFeedbackType] = useState('general');
  const [page, setPage] = useState('general');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "Message is empty",
        description: "Please write something before submitting.",
        variant: "destructive",
      });
      return;
    }

    console.log({
      feedbackType,
      page,
      message,
    });
    
    toast({
      title: "Feedback Submitted!",
      description: "Thank you for your valuable input. This is a demo and data was logged to the console.",
    });

    setMessage('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <MessageSquare className="mr-3 h-8 w-8 text-primary" />
          Feedback, Suggestions & Support
        </h1>
        <p className="text-muted-foreground">
          Your input is valuable in making OpenWritingKit better for everyone.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Submit Your Feedback</CardTitle>
              <CardDescription>
                Have a suggestion, found a bug, or want to give general feedback? Let us know!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback-type">Type of Feedback</Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger id="feedback-type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Feedback</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="suggestion">Feature Suggestion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-context">Related Page (Optional)</Label>
                <Select value={page} onValueChange={setPage}>
                  <SelectTrigger id="page-context">
                    <SelectValue placeholder="Select a page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General / Unrelated</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="outline">Outline Builder</SelectItem>
                    <SelectItem value="characters">Characters</SelectItem>
                    <SelectItem value="plot-tools">Plot Tools</SelectItem>
                    <SelectItem value="ai-tools">AI Tools</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="settings">Settings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-message">Your Message</Label>
                <Textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  rows={8}
                  required
                />
              </div>
            </CardContent>
            <CardContent>
               <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </CardContent>
          </form>
        </Card>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lightbulb className="h-8 w-8 text-primary" />
                <CardTitle>Contribute on GitHub</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                OpenWritingKit is an open-source project. If you're a developer, you can contribute directly to the codebase, fix bugs, or add new features.
              </p>
              <a href="https://github.com/your-repo/openwritingkit" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">View on GitHub</Button>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Coffee className="h-8 w-8 text-primary" />
                <CardTitle>Support the Project</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you find this tool useful, consider supporting its development. Your contribution helps cover costs and fuels further improvements.
              </p>
               <Link href="https://ko-fi.com/expectaylor" target="_blank" rel="noopener noreferrer">
                <Button variant="default" className="w-full">
                    Buy Me a Coffee
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
