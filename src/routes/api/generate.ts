import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { PROMPTS, type FeatureKey } from "@/lib/prompts";

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { feature, input } = (await request.json()) as {
            feature: FeatureKey;
            input: string;
          };
          if (!feature || !PROMPTS[feature]) {
            return new Response("Invalid feature", { status: 400 });
          }
          if (!input || typeof input !== "string") {
            return new Response("Input required", { status: 400 });
          }
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

          const gateway = createLovableAiGatewayProvider(key);
          const { text } = await generateText({
            model: gateway("google/gemini-3-flash-preview"),
            system: PROMPTS[feature],
            prompt: input,
          });

          return Response.json({ text });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          const status = /rate.?limit|429/i.test(message)
            ? 429
            : /credit|402/i.test(message)
              ? 402
              : 500;
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
