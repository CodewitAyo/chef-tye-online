import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM_PROMPT = `You are Superstar, the Chef Tye website assistant.

Chef Tye is a Lagos-based private chef. Every meal is hand-prepared by Chef Tye himself. Orders go through Chowdeck ("Chef Tye"), WhatsApp/Phone (+234 811 861 5254), or X (@tye_chef).

The menu:
- Holy Grail — signature pasta.
- ASAP — asun-style goat, spicy and smoky.
- Obiageli — native-style pasta.
- Rich Flex — loaded sandwich.
- Lust — chicken and potato stir-fry.
- Ecstasy — chicken, bold and flavorful.
When asked to recommend something, actually name one of these dishes rather than describing categories in general — pick based on what the person seems to want (spicy, hearty, lighter, etc.), and mention a plausible reason. If asked a specific detail you don't actually know (exact ingredients, allergens, spice level), say so honestly and point them to the Menu page or direct contact rather than guessing.

Loyalty program "Chef Tye Elites":
- Earn 1 point per ₦1,000 spent on meal subtotal (delivery excluded).
- Member (0–99), VIP (100–199), Elite Circle (200+).
- Rewards are redeemed on the Account dashboard then honored by the kitchen.

You can point people to: the Home page, the Menu page, the Join/Loyalty page, the Sign In page, their Account dashboard (for signed-in users), the Feed The Streets charity page, the Donate page, and the Contact page. Never mention raw URL paths (like /menu) in your responses — always refer to pages by name.

Feed The Streets is Chef Tye's December charity feeding vulnerable children in Lagos.

Rules: warm, brief, 1–3 short paragraphs. Point people at the right page by name. Never invent prices. Never claim to have performed actions.`;

const askInput = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(20)
    .optional(),
});

type ChatMsg = { role: string; content: string };

type ProviderResult =
  | { ok: true; reply: string }
  | { ok: false; status: number; body: string };

/**
 * Calls an OpenAI-compatible chat completions endpoint. Groq and Cerebras both
 * speak this exact shape, so the same helper drives both providers — only the
 * URL, key, and model id differ.
 */
async function callChatProvider(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMsg[],
): Promise<ProviderResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, max_tokens: 400 }),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      return { ok: false, status: res.status, body: errBody.slice(0, 500) };
    }
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = body.choices?.[0]?.message?.content?.trim();
    if (!reply) return { ok: false, status: 0, body: "empty completion" };
    return { ok: true, reply };
  } catch (err) {
    return { ok: false, status: 0, body: String(err) };
  }
}

export const chatbotAsk = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => askInput.parse(d))
  .handler(async ({ data }) => {
    const groqKey = process.env.GROQ_API_KEY;
    const cerebrasKey = process.env.CEREBRAS_API_KEY;
    if (!groqKey && !cerebrasKey) {
      return {
        reply:
          "I'm having trouble reaching my brain right now. Try the menu, loyalty or contact pages, or ask again in a moment.",
      };
    }
    const messages: ChatMsg[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(data.history ?? []),
      { role: "user", content: data.message },
    ];

    // Groq first — fastest and generous free tier. Cerebras is the backup:
    // same OpenAI-compatible shape, same gpt-oss-120b model, separate
    // free-tier quota, so a Groq outage or rate-limit doesn't take the
    // chatbot down. We fall through on ANY Groq failure (network error,
    // bad key, 429, deprecated model, etc.) rather than special-casing
    // individual status codes, since the whole point of a fallback is not
    // having to enumerate every way the primary provider can fail.
    let last: ProviderResult | undefined;
    if (groqKey) {
      const result = await callChatProvider(
        "https://api.groq.com/openai/v1/chat/completions",
        groqKey,
        "openai/gpt-oss-120b",
        messages,
      );
      if (result.ok) return { reply: result.reply };
      console.error("[chat] groq failed, trying cerebras", result.status, result.body);
      last = result;
    }

    if (cerebrasKey) {
      const result = await callChatProvider(
        "https://api.cerebras.ai/v1/chat/completions",
        cerebrasKey,
        "gpt-oss-120b",
        messages,
      );
      if (result.ok) return { reply: result.reply };
      console.error("[chat] cerebras failed", result.status, result.body);
      last = result;
    }

    if (last && !last.ok && last.status === 429) {
      return { reply: "Too many questions — try again in a moment." };
    }
    return { reply: "Something went wrong on my end. Please try again." };
  });

const persistInput = z.object({
  conversationId: z.string().uuid().nullable(),
  userMessage: z.string().min(1).max(4000),
  assistantMessage: z.string().min(1).max(6000),
  intentId: z.string().max(60).optional(),
});

export const persistChatTurn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => persistInput.parse(d))
  .handler(async ({ data }) => {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const { createPublicServerClient } = await import("@/lib/supabase-public.server");

    const authHeader = getRequestHeader("authorization");
    const token =
      authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
    const supabase = createPublicServerClient(token);

    let userId: string | null = null;
    if (token) {
      const { data: claims } = await supabase.auth.getClaims(token);
      userId = (claims?.claims?.sub as string | undefined) ?? null;
    }

    let convId = data.conversationId;
    if (!convId) {
      const { data: conv, error } = await supabase
        .from("chat_conversations")
        .insert({ user_id: userId, status: "open" })
        .select("id")
        .single();
      if (error || !conv) {
        console.error("[chat] conversation insert failed", error);
        throw new Error("Could not start conversation");
      }
      convId = conv.id;
    }

    const { error: msgErr } = await supabase.from("chat_messages").insert([
      { conversation_id: convId, role: "user", content: data.userMessage },
      { conversation_id: convId, role: "assistant", content: data.assistantMessage, tool_name: data.intentId ?? null },
    ]);
    if (msgErr) console.error("[chat] message insert failed", msgErr);

    await supabase
      .from("chat_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", convId);

    return { conversationId: convId };
  });


/** Loads the signed-in user's most recent open conversation and its messages. */
export const loadRecentConversation = createServerFn({ method: "POST" }).handler(async () => {
  const { getRequestHeader } = await import("@tanstack/react-start/server");
  const { createPublicServerClient } = await import("@/lib/supabase-public.server");

  const authHeader = getRequestHeader("authorization");
  const token =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!token) return { conversationId: null, messages: [] as { role: string; content: string }[] };

  const supabase = createPublicServerClient(token);
  const { data: claims } = await supabase.auth.getClaims(token);
  const userId = (claims?.claims?.sub as string | undefined) ?? null;
  if (!userId) return { conversationId: null, messages: [] as { role: string; content: string }[] };

  const { data: conv } = await supabase
    .from("chat_conversations")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "open")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (!conv) return { conversationId: null, messages: [] as { role: string; content: string }[] };

  const { data: msgs } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true })
    .limit(50);

  return {
    conversationId: conv.id as string,
    messages: (msgs ?? []).map((m) => ({ role: m.role as string, content: m.content as string })),
  };
});


