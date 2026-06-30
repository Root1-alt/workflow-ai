# WorkFlow AI Assistant — Plan

## Stack note (important)
Your spec asks for ASP.NET Core + SQL Server + OpenAI. Lovable projects run on **TanStack Start (React 19) + Tailwind + shadcn/ui**, with **Lovable Cloud** (Postgres + auth + edge functions) as the backend and **Lovable AI Gateway** for GPT/Gemini models. I'll build the same product, same features, same UX — just on this stack. The architectural patterns you asked for (controllers/DTOs/services, history tables, JWT auth, prompt engineering, responsible-AI disclaimers) all map cleanly.

If you specifically need .NET/SQL Server source code, Lovable can't produce a runnable backend in that stack — let me know and I'll instead deliver this as a React frontend + documented C# backend spec.

## Scope (single build)

### Shell
- Sidebar nav (collapsible on mobile via `shadcn/sidebar`): Dashboard, Email Generator, Meeting Summarizer, Task Planner, Research Assistant, AI Chatbot, Settings, About.
- Topbar: dark/light toggle, user menu.
- Gradient headers, rounded cards, shadows, smooth transitions, loading spinners, toast notifications (sonner).
- Responsible-AI disclaimer banner on every AI page.

### Pages / Routes (TanStack file routes)
- `/` Dashboard — welcome, stats cards (AI requests, today's tasks, productivity score), recent activity, quick actions.
- `/email` Smart Email Generator — recipient, subject, purpose, key points, tone selector (Professional/Friendly/Persuasive/Formal/Apology/Follow-up/Thank You). Output: subject, greeting, body, closing, signature. Buttons: Copy, Regenerate, Clear, Download (.txt/.docx), Save to history.
- `/meetings` Meeting Notes Summarizer — paste notes → cards for Executive Summary, Action Items, Decisions, Deadlines, Key Points, Risks, Follow-ups.
- `/tasks` AI Task Planner — task list form (task, due date, priority, est. duration, working hours) → daily schedule timeline cards, weekly planner, priority ranking, suggested breaks, productivity tips.
- `/research` AI Research Assistant — topic or pasted article → Summary, Key Insights, Important Facts, Pros, Cons, Recommendations, Related Topics.
- `/chat` AI Chatbot — AI Elements composer + transcript, session memory, typing shimmer, timestamps, role bubbles.
- `/settings` — theme, default tone, clear history.
- `/about` — product info + responsible-AI statement.

### Backend (Lovable Cloud)
- Auth: email/password (JWT-equivalent via Supabase Auth). All pages gated by `_authenticated` layout.
- Postgres tables (with RLS scoped to `auth.uid()`):
  - `profiles`, `user_roles` (separate roles table per security rules)
  - `ai_requests` (feature, prompt, response, tokens, created_at, user_id)
  - `emails`, `meetings`, `tasks`, `research_history`, `chat_history`
- Each table: history list with search, view, delete.

### Edge functions (one per feature, mirroring your REST design)
- `email-generate`, `meeting-summarize`, `tasks-plan`, `research-summarize`, `chat-message`
- Call Lovable AI Gateway (`google/gemini-3-flash-preview` default; chat streams).
- Engineered system prompts per your spec.
- Handle 429 (rate limit) and 402 (credits) with friendly toasts.
- Log every request to `ai_requests`.

### Professional features
- Copy to clipboard, Download as .txt/.docx (client-side via `docx` lib), Save/Search/Delete history, character counter, loading states, error toasts, empty-state messages.

### Design system
- Custom semantic tokens in `src/styles.css` (HSL). Gradient primary, elegant shadows. Distinctive typography pair (e.g. Space Grotesk + Inter) loaded via `<link>` in `__root.tsx`. Dark mode via `class` strategy.

## Out of scope
- Permanent storage of sensitive content beyond user's own history (user-deletable).
- PDF export (will offer .docx + copy; can add jsPDF later if you want).

## Technical mapping
| Your spec | Implementation |
|---|---|
| ASP.NET controllers/DTOs/services | Edge functions + typed request/response schemas (zod) |
| EF Core + SQL Server | Supabase Postgres + migrations |
| JWT auth | Supabase Auth (JWT under the hood) |
| OpenAI API | Lovable AI Gateway (Gemini/GPT models) |
| Repository pattern | Per-feature service modules in `src/lib/` |

Confirm and I'll build it.