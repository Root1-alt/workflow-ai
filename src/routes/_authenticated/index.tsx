import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Mail,
  FileText,
  CalendarCheck,
  Search,
  MessageSquare,
  TrendingUp,
  Activity,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStats, getActivity } from "@/lib/ai-client";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — WorkFlow AI Assistant" },
      { name: "description", content: "Your AI-powered workplace productivity command center." },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { title: "Email Generator", to: "/email", icon: Mail, color: "from-blue-500 to-indigo-600" },
  { title: "Meeting Summarizer", to: "/meetings", icon: FileText, color: "from-purple-500 to-pink-600" },
  { title: "Task Planner", to: "/tasks", icon: CalendarCheck, color: "from-emerald-500 to-teal-600" },
  { title: "Research Assistant", to: "/research", icon: Search, color: "from-amber-500 to-orange-600" },
  { title: "AI Chatbot", to: "/chat", icon: MessageSquare, color: "from-cyan-500 to-sky-600" },
] as const;

function Dashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [activity, setActivity] = useState<Array<{ label: string; at: number }>>([]);

  useEffect(() => {
    setStats(getStats());
    setActivity(getActivity());
  }, []);

  const aiRequests = stats.aiRequests || 0;
  const score = Math.min(100, 40 + aiRequests * 3);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3 w-3" /> Welcome back
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Get more done with WorkFlow AI
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">
            Generate emails, summarize meetings, plan your day, research topics, and chat — all in
            one intelligent workspace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Zap} label="AI Requests" value={String(aiRequests)} hint="this session" />
        <StatCard icon={CheckCircle2} label="Today's Tasks" value={String(stats.tasks || 0)} hint="planned" />
        <StatCard icon={Activity} label="Recent Activity" value={String(activity.length)} hint="events" />
        <StatCard icon={TrendingUp} label="Productivity" value={`${score}%`} hint="score" />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to} className="group">
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <CardContent className="flex flex-col items-start gap-3 p-5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${a.color} text-white shadow-md`}
                  >
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{a.title}</div>
                    <div className="text-xs text-muted-foreground">Open tool →</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No activity yet. Try generating an email or summarizing a meeting to get started.
              <div className="mt-4">
                <Button asChild>
                  <Link to="/email">Generate your first email</Link>
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {activity.slice(0, 8).map((a, i) => (
                <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{a.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}
