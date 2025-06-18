import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your LinguaFlow preferences and account details.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle>Application Settings</CardTitle>
          </div>
          <CardDescription>
            Customize your LinguaFlow experience. More settings will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Feature settings, theme customizations, and account management options will be available here in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
