import { PromptGeneratorCard } from '@/components/ai/PromptGeneratorCard';
import { PacingAnalyzerCard } from '@/components/ai/PacingAnalyzerCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, BarChartHorizontalBig, Users } from 'lucide-react';

export default function AiToolsPage() {
  const comingSoonTools = [
    { title: "Plot Hole Detector", description: "Identifies potential inconsistencies in your plot.", icon: Lightbulb },
    { title: "Character Voice Consistency", description: "Checks if your characters speak in a consistent voice.", icon: Users },
    { title: "Genre-specific Writing Tips", description: "Tailored advice for your chosen genre.", icon: BarChartHorizontalBig },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Writing Assistant</h1>
        <p className="text-muted-foreground">Leverage AI to enhance your creative writing process.</p>
      </div>

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
    </div>
  );
}
