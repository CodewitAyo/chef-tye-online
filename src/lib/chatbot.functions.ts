import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM_PROMPT = `You are Superstar, the Chef Tye website assistant.

Chef Tye is a Lagos-based private chef known for bold pasta, rice bowls and stir-fries. Every meal is hand-prepared by Chef Tye himself. Orders go through Chowdeck ("Chef Tye"), WhatsApp/Phone (+234 811 861 5254), or X (@tye_chef).

Loyalty program "Chef Tye Elites":
- Earn 1 point per ₦1,000 spent on meal subtotal (delivery excluded).
- Member (0–99), VIP (100–199), Elite Circle (200+).
- Rewards are redeemed on the /account page then honored by the kitchen.

Site pages: /, /menu, /join, /auth, /account (protected), /charity, /donate, /contact.

Feed The Streets is Chef Tye's December charity feeding vulnerable children in Lagos.

Rules: warm, brief, 1–3 short paragraphs. Point people at the right page. Never invent prices. Never claim to have performed actions.`;

const askInput = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(20)
    .optional(),
});

export const chatbotAsk = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => askInput.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        reply:
          "I'm having trouble reaching my brain right now. Try the menu, loyalty or contact pages, or ask again in a moment.",
      };
    }
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(data.history ?? []),
      { role: "user", content: data.message },
    ];
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, max_tokens: 400 }),
      });
      if (!res.ok) {
        if (res.status === 429) return { reply: "Too many questions — try again in a moment." };
        if (res.status === 402) return { reply: "The kitchen's AI credits are running low. Please try again later." };
        return { reply: "Something went wrong on my end. Please try again." };
      }
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const reply = body.choices?.[0]?.message?.content?.trim() || "I'm not sure — try /contact and Chef Tye's team will help.";
      return { reply };
    } catch (err) {
      console.error("chatbotAsk error", err);
      return { reply: "I couldn't reach my brain. Please try again in a moment." };
    }
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


