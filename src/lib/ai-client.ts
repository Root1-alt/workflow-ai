export async function generateAI(feature: string, input: string): Promise<string> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feature, input }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit exceeded. Please try again in a moment.");
    if (res.status === 402)
      throw new Error("AI credits exhausted. Please add credits to your workspace.");
    const data = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  const data = (await res.json()) as { text: string };
  return data.text;
}

export function saveHistory(key: string, entry: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem(key) || "[]") as Array<Record<string, unknown>>;
    const next = [{ id: crypto.randomUUID(), createdAt: Date.now(), ...entry }, ...existing].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(next));
    bumpStat("aiRequests");
    pushActivity(`${entry.feature ?? key} generated`);
  } catch {
    /* ignore */
  }
}

export function loadHistory<T = Record<string, unknown>>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

export function deleteHistoryItem(key: string, id: string) {
  if (typeof window === "undefined") return;
  const items = loadHistory(key).filter((i) => (i as { id: string }).id !== id);
  localStorage.setItem(key, JSON.stringify(items));
}

export function bumpStat(name: string) {
  if (typeof window === "undefined") return;
  const stats = JSON.parse(localStorage.getItem("wf_stats") || "{}");
  stats[name] = (stats[name] || 0) + 1;
  localStorage.setItem("wf_stats", JSON.stringify(stats));
}

export function getStats(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("wf_stats") || "{}");
  } catch {
    return {};
  }
}

export function pushActivity(label: string) {
  if (typeof window === "undefined") return;
  const items = JSON.parse(localStorage.getItem("wf_activity") || "[]") as Array<{
    label: string;
    at: number;
  }>;
  items.unshift({ label, at: Date.now() });
  localStorage.setItem("wf_activity", JSON.stringify(items.slice(0, 20)));
}

export function getActivity(): Array<{ label: string; at: number }> {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("wf_activity") || "[]");
  } catch {
    return [];
  }
}
