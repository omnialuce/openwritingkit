
// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Cloud, Brain } from "lucide-react"; // Added Brain icon

const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';

export default function SettingsPage() {
  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedPreference = localStorage.getItem(AI_OPT_IN_KEY);
    setAiFeaturesEnabled(storedPreference === 'true');
  }, []);

  const handleAiToggle = (enabled: boolean) => {
    setAiFeaturesEnabled(enabled);
    if (isMounted) {
      localStorage.setItem(AI_OPT_IN_KEY, enabled ? 'true' : 'false');
    }
  };

  if (!isMounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your OpenWritingKit preferences and account details.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <CardTitle>AI Feature Preferences</CardTitle>
          </div>
          <CardDescription>
            Control your experience with AI-powered writing assistance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="ai-features-toggle"
              checked={aiFeaturesEnabled}
              onCheckedChange={handleAiToggle}
              aria-labelledby="ai-features-label"
            />
            <Label htmlFor="ai-features-toggle" id="ai-features-label" className="flex-grow">
              Enable AI Writing Assistance
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            By enabling AI features, you agree that the text you submit for a specific AI function (e.g., "Get Writing Feedback," "Analyze Pacing," "Generate Prompt") 
            will be sent to a third-party AI model for processing to provide that feature. 
            OpenWritingKit does not store this submitted text on its servers or use it for training its own AI models. 
            Your primary document content remains stored locally in your browser. You can disable AI features at any time.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle>Application Settings</CardTitle>
          </div>
          <CardDescription>
            Customize your OpenWritingKit experience. More settings will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Theme customizations, editor preferences, and general account management options will be available here in future updates.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            <CardTitle>Cloud Backup & Sync</CardTitle>
          </div>
          <CardDescription>
            Securely back up your work to the cloud and sync across devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Connect your account to enable cloud backup and synchronization features. This will allow you to access your writing projects from anywhere.
          </p>
          <Button disabled className="w-full md:w-auto">
            Connect to Cloud (Coming Soon)
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
