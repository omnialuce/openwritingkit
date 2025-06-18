
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Cloud } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your OpenWriting Kit preferences and account details.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle>Application Settings</CardTitle>
          </div>
          <CardDescription>
            Customize your OpenWriting Kit experience. More settings will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Theme customizations, editor preferences, and account management options will be available here in future updates.
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
