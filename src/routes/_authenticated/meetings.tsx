import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Disclaimer } from "@/components/disclaimer";
import { Markdown } from "@/components/markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { generateAI, saveHistory } from "@/lib/ai-client";
import { EmptyState, SkeletonOutput } from "./email";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({ meta: [{ title: "Meeting Summarizer — WorkFlow AI" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function summarize() {
    if (notes.trim().length < 20) {
      toast.error("Please paste at least a paragraph of meeting notes.");
      return;
    }
    setLoading(true);
    try {
      const text = await generateAI("meeting", notes);
      setOutput(text);
      saveHistory("wf_meetings", { feature: "Meeting", notesPreview: notes.slice(0, 100), output: text });
      toast.success("Meeting summarized");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        icon={FileText}
        title="Meeting Notes Summarizer"
        description="Turn raw meeting notes into a structured summary with action items and risks."
      />
      <Disclaimer />

      <Card>
        <CardContent className="space-y-3 p-6">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste meeting notes here..."
            rows={10}
            className="font-mono text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{notes.length} characters</span>
            <Button onClick={summarize} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Summarize
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Summary</h3>
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
            <EmptyState text="Paste your meeting notes above to generate a structured summary." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
