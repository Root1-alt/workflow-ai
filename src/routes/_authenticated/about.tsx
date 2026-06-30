import { createFileRoute } from "@tanstack/react-router";
import { Info, Shield, Zap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/about")({
  head: () => ({ meta: [{ title: "About — WorkFlow AI" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={Info}
        title="About WorkFlow AI"
        description="A modern AI productivity suite for business teams."
      />

      <Card>
        <CardContent className="space-y-4 p-6 text-sm leading-relaxed">
          <p>
            <strong>WorkFlow AI Assistant</strong> helps employees save time and improve
            productivity through generative AI — from drafting professional emails and summarizing
            meetings to planning your day, researching topics, and chatting with an intelligent
            workplace assistant.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Feature icon={Zap} title="Five AI tools">
              Email Generator, Meeting Summarizer, Task Planner, Research Assistant, and AI Chatbot
              — all in one workspace.
            </Feature>
            <Feature icon={Shield} title="Responsible AI">
              History stays in your browser. Outputs are always shown with a review disclaimer.
            </Feature>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-6 text-sm">
          <h3 className="font-semibold">Responsible AI statement</h3>
          <p className="text-muted-foreground">
            AI-generated content may contain inaccuracies. Always review generated content before
            using it for professional or business purposes. We do not permanently store sensitive
            information you provide; your history is kept locally in your browser and you can clear
            it at any time from Settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Info;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-1.5 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground">{children}</p>
    </div>
  );
}
