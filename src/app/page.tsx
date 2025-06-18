import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookText, Cpu, BarChart3, FolderOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const quickActions = [
    { title: "New Document", description: "Start writing in the editor.", href: "/editor", icon: BookText, cta: "Open Editor" },
    { title: "AI Tools", description: "Explore creative writing prompts and analysis.", href: "/ai-tools", icon: Cpu, cta: "Use AI Tools" },
    { title: "My Documents", description: "Manage your saved work.", href: "/documents", icon: FolderOpen, cta: "View Documents" },
    { title: "Writing Analytics", description: "Track your progress and insights.", href: "/analytics", icon: BarChart3, cta: "See Analytics" },
  ];

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 md:p-8 rounded-none border">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to LinguaFlow</h1>
            <p className="text-lg text-foreground mb-6">
              Your intelligent writing companion. Unleash creativity, refine prose, and stay focused.
            </p>
            <Link href="/editor" passHref>
              <Button size="lg" className="rounded-none">
                Start Writing <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="hidden md:block">
            <Image 
              src="https://placehold.co/500x300.png" 
              alt="LinguaFlow illustrative banner" 
              width={500} 
              height={300}
              className="rounded-none"
              data-ai-hint="geometric abstract composition"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow duration-300 rounded-none border">
              <CardHeader>
                <div className="flex items-start gap-3 mb-2">
                  <action.icon className="h-7 w-7 text-primary mt-1" />
                  <div>
                    <CardTitle className="text-xl">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter>
                <Link href={action.href} passHref className="w-full">
                  <Button variant="outline" className="w-full rounded-none">
                    {action.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-none border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest documents and writing sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity yet. Start writing to see your progress here!</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardHeader>
            <CardTitle>Writing Streak</CardTitle>
            <CardDescription>Keep your momentum going!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">0</p>
              <p className="text-muted-foreground">days</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
