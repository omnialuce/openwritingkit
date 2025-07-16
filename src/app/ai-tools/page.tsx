
// src/app/ai-tools/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PromptGeneratorCard } from '@/components/ai/PromptGeneratorCard';
import { PacingAnalyzerCard } from '@/components/ai/PacingAnalyzerCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Users, Settings, AlertTriangle } from 'lucide-react';

const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';

export default function AiToolsPage() {
  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedPreference = localStorage.getItem(AI_OPT_IN_KEY);
    setAiFeaturesEnabled(storedPreference === 'true');

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AI_OPT_IN_KEY) {
        setAiFeaturesEnabled(event.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const comingSoonTools = [
    { title: "Plot Hole Detector", description: "Identifies potential inconsistencies in your plot.", icon: Lightbulb },
    { title: "Character Voice Consistency", description: "Checks if your characters speak in a consistent voice.", icon: Users },
  ];

  if (!isMounted) {
    return ( // Or a loading spinner
      <div className="flex justify-center items-center h-64">
        <p>Loading AI tool preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Writing Assistant</h1>
        <p className="text-muted-foreground">Leverage AI to enhance your creative writing process.</p>
      </div>

      {!aiFeaturesEnabled ? (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <CardTitle className="text-xl text-destructive">AI Features Disabled</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              AI-powered writing assistance is currently disabled in your settings. To use these tools, please enable them.
            </p>
            <Link href="/settings" passHref>
              <Button variant="secondary">
                <Settings className="mr-2 h-4 w-4" /> Go to Settings
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">
              Enabling AI features involves sending selected text to third-party AI models for processing. Please review the disclaimer in settings before enabling.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            <PromptGeneratorCard />
            <PacingAnalyzerCard />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mt-12 mb-6">More AI Tools Coming Soon!</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {comingSoonTools.map((tool) => (
                <Card key={tool.title} className="opacity-70">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <tool.icon className="h-8 w-8 text-muted-foreground" />
                      <CardTitle className="text-xl text-muted-foreground">{tool.title}</CardTitle>
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-primary font-semibold">Coming Soon</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
