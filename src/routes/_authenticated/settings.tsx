import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/use-theme";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — WorkFlow AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();

  function clearAll() {
    [
      "wf_emails",
      "wf_meetings",
      "wf_tasks",
      "wf_research",
      "wf_activity",
      "wf_stats",
    ].forEach((k) => localStorage.removeItem(k));
    toast.success("All history cleared");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Customize your WorkFlow AI workspace."
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <h3 className="font-semibold">Appearance</h3>
          <div className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
            >
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
            >
              Dark
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <h3 className="font-semibold">Data & Privacy</h3>
          <p className="text-sm text-muted-foreground">
            History is stored only in your browser. We never permanently store sensitive content on
            our servers. Clear it any time.
          </p>
          <Button variant="destructive" onClick={clearAll}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear all history
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
