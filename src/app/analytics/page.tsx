import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, BookOpen, Users, FileText, Percent } from "lucide-react";
import Image from "next/image";
import { WordGoalCard } from "@/components/analytics/WordGoalCard"; // Import the new component

interface InsightCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  value?: string;
  unit?: string;
}

function InsightCard({ title, description, icon: Icon, value, unit }: InsightCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-1">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {value ? (
          <p className="text-3xl font-bold">
            {value} <span className="text-lg text-muted-foreground">{unit}</span>
          </p>
        ) : (
          <p className="text-muted-foreground">Data will appear here once you start writing.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const insights = [
    { title: "Word Count Trends", description: "Track your daily/weekly writing output.", icon: BarChart3, value: "1,200", unit: "words this week" },
    { title: "Productive Times", description: "Discover when you write the most.", icon: Clock, value: "Evenings", unit: "" },
    { title: "Vocabulary Richness", description: "Assess the diversity of your word usage.", icon: BookOpen, value: "Good", unit: "score" },
    { title: "Dialogue Ratio", description: "Analyze dialogue vs. narrative balance.", icon: Users, value: "35%", unit: "dialogue" },
    { title: "Chapter Length Consistency", description: "Monitor the consistency of your chapter lengths.", icon: FileText, value: "Consistent", unit: "" },
    { title: "Reading Difficulty", description: "Gauge the readability of your text.", icon: Percent, value: "Grade 8", unit: "level" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Writing Analytics & Insights</h1>
        <p className="text-muted-foreground">Understand your writing patterns and improve your craft.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <WordGoalCard /> 
        {/* Add more specific analytics cards or integrate WordGoalCard better */}
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">General Writing Statistics</h2>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
            <InsightCard key={insight.title} {...insight} />
            ))}
        </div>
      </div>


      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Overall Progress Overview</CardTitle>
          <CardDescription>A visual summary of your writing journey.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
           <Image src="https://placehold.co/800x300.png" data-ai-hint="monochrome data chart graph" alt="Progress chart placeholder" width={800} height={300} className="mx-auto rounded-md" />
          <p className="text-muted-foreground mt-4">Detailed charts and graphs are coming soon to help you visualize your progress.</p>
        </CardContent>
      </Card>
    </div>
  );
}
