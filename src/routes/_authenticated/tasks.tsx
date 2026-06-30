import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Loader2, Plus, X, Copy } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Disclaimer } from "@/components/disclaimer";
import { Markdown } from "@/components/markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateAI, saveHistory, bumpStat } from "@/lib/ai-client";
import { EmptyState, SkeletonOutput } from "./email";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Task Planner — WorkFlow AI" }] }),
  component: TasksPage,
});

type Task = {
  id: string;
  title: string;
  due: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  duration: string;
};

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: crypto.randomUUID(), title: "", due: "", priority: "Medium", duration: "30" },
  ]);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function addTask() {
    setTasks((ts) => [
      ...ts,
      { id: crypto.randomUUID(), title: "", due: "", priority: "Medium", duration: "30" },
    ]);
  }

  function removeTask(id: string) {
    setTasks((ts) => ts.filter((t) => t.id !== id));
  }

  async function plan() {
    const valid = tasks.filter((t) => t.title.trim());
    if (valid.length === 0) {
      toast.error("Add at least one task.");
      return;
    }
    setLoading(true);
    try {
      const input = `Working hours: ${start} – ${end}

Tasks:
${valid
  .map(
    (t, i) =>
      `${i + 1}. ${t.title} | Priority: ${t.priority} | Due: ${t.due || "n/a"} | Est: ${t.duration} min`,
  )
  .join("\n")}`;
      const text = await generateAI("tasks", input);
      setOutput(text);
      saveHistory("wf_tasks", { feature: "Tasks", count: valid.length, output: text });
      bumpStat("tasks");
      toast.success("Plan generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        icon={CalendarCheck}
        title="AI Task Planner"
        description="Build a realistic, optimized daily and weekly schedule from your task list."
      />
      <Disclaimer />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-muted-foreground">Work day start</Label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-muted-foreground">Work day end</Label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            {tasks.map((t, i) => (
              <div
                key={t.id}
                className="grid grid-cols-12 items-end gap-2 rounded-lg border border-border p-3"
              >
                <div className="col-span-12 md:col-span-5">
                  <Label className="text-xs text-muted-foreground">Task {i + 1}</Label>
                  <Input
                    value={t.title}
                    onChange={(e) => updateTask(t.id, { title: e.target.value })}
                    placeholder="What needs to get done?"
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label className="text-xs text-muted-foreground">Due</Label>
                  <Input
                    type="date"
                    value={t.due}
                    onChange={(e) => updateTask(t.id, { due: e.target.value })}
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Select
                    value={t.priority}
                    onValueChange={(v) => updateTask(t.id, { priority: v as Task["priority"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["Low", "Medium", "High", "Urgent"] as const).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-10 md:col-span-2">
                  <Label className="text-xs text-muted-foreground">Duration (min)</Label>
                  <Input
                    type="number"
                    value={t.duration}
                    onChange={(e) => updateTask(t.id, { duration: e.target.value })}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTask(t.id)}
                    disabled={tasks.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addTask}>
              <Plus className="mr-1.5 h-4 w-4" /> Add task
            </Button>
          </div>

          <div className="flex justify-end">
            <Button onClick={plan} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Your Schedule</h3>
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
            <EmptyState text="Add tasks and generate a plan to see your daily timeline here." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
