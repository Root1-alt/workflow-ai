import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Disclaimer } from "@/components/disclaimer";
import { Markdown } from "@/components/markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { generateAI, saveHistory } from "@/lib/ai-client";
import { EmptyState, SkeletonOutput } from "./email";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "Research Assistant — WorkFlow AI" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    if (input.trim().length < 5) {
      toast.error("Enter a research topic or paste an article.");
      return;
    }
    setLoading(true);
    try {
      const text = await generateAI("research", input);
      setOutput(text);
      saveHistory("wf_research", { feature: "Research", preview: input.slice(0, 100), output: text });
      toast.success("Research complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        icon={Search}
        title="AI Research Assistant"
        description="Summarize topics or articles with insights, pros, cons, and recommendations."
      />
      <Disclaimer />

      <Card>
        <CardContent className="space-y-3 p-6">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a research topic or paste an article..."
            rows={8}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{input.length} characters</span>
            <Button onClick={run} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Research
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Results</h3>
            {output && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success("Copied");
                }}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
              </Button>
            )}
          </div>
          {loading ? (
            <SkeletonOutput />
          ) : output ? (
            <Markdown>{output}</Markdown>
          ) : (
            <EmptyState text="Enter a topic above to get a structured research breakdown." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
