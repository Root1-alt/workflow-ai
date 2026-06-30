import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Loader2, Copy, RefreshCw, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Disclaimer } from "@/components/disclaimer";
import { Markdown } from "@/components/markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateAI, saveHistory } from "@/lib/ai-client";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [{ title: "Email Generator — WorkFlow AI" }] }),
  component: EmailPage,
});

const TONES = [
  "Professional",
  "Friendly",
  "Persuasive",
  "Formal",
  "Apology",
  "Follow-up",
  "Thank You",
];

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState("Professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!purpose.trim()) {
      toast.error("Please describe the email purpose.");
      return;
    }
    setLoading(true);
    try {
      const input = `Recipient: ${recipient || "(unspecified)"}
Subject hint: ${subject || "(let AI suggest)"}
Purpose: ${purpose}
Key points: ${keyPoints || "(none)"}
Tone: ${tone}`;
      const text = await generateAI("email", input);
      setOutput(text);
      saveHistory("wf_emails", { feature: "Email", recipient, subject, tone, output: text });
      toast.success("Email generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setRecipient("");
    setSubject("");
    setPurpose("");
    setKeyPoints("");
    setOutput("");
  }

  function copy() {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  }

  function download() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Generate professional, on-tone emails in seconds."
      />
      <Disclaimer />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Recipient">
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Jane Doe, Marketing Lead"
                />
              </Field>
              <Field label="Subject (optional)">
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Quarterly review request"
                />
              </Field>
            </div>
            <Field label="Email purpose">
              <Textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="What do you want this email to achieve?"
                rows={3}
              />
              <Counter value={purpose} max={500} />
            </Field>
            <Field label="Key points">
              <Textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="Bullet the main points (optional)"
                rows={4}
              />
              <Counter value={keyPoints} max={1000} />
            </Field>
            <Field label="Tone">
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={generate} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Generate Email
              </Button>
              <Button variant="outline" onClick={generate} disabled={loading || !output}>
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
              </Button>
              <Button variant="ghost" onClick={clearAll}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Generated Email</h3>
              {output && (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={copy}>
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button size="sm" variant="ghost" onClick={download}>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> .txt
                  </Button>
                </div>
              )}
            </div>
            {loading ? (
              <SkeletonOutput />
            ) : output ? (
              <Markdown>{output}</Markdown>
            ) : (
              <EmptyState text="Fill in the form and click Generate Email." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <div className="text-right text-xs text-muted-foreground">
      {value.length} / {max}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export function SkeletonOutput() {
  return (
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${60 + ((i * 7) % 40)}%` }} />
      ))}
    </div>
  );
}
