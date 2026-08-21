import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, X, Send, Loader2, ChefHat } from "lucide-react";
import { matchIntent } from "@/lib/chatbot-intents";
import { chatbotAsk, persistChatTurn } from "@/lib/chatbot.functions";
import { useAuth } from "@/lib/use-auth";



type Msg = {
  role: "user" | "assistant";
  content: string;
  actions?: { label: string; to?: string; href?: string }[];
};

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hey — I'm Superstar, Chef Tye's website assistant. Ask me about the menu, loyalty & rewards, ordering, Feed The Streets, or your account.",
  actions: [
    { label: "See Menu", to: "/menu" },
    { label: "Loyalty", to: "/join" },
    { label: "Contact", to: "/contact" },
  ],
};

// Chat history is kept in sessionStorage rather than restored from the
// database on mount. sessionStorage is scoped to a single tab and is wiped
// the moment that tab closes, so a visitor never reopens the site (or the
// widget) to find a transcript from a previous visit — while a same-tab page
// refresh still keeps the conversation intact.
const SESSION_STORAGE_KEY = "superstar-chat-session";

type StoredSession = { conversationId: string | null; messages: Msg[] };

function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => readStoredSession()?.messages ?? [GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const conversationIdRef = useRef<string | null>(readStoredSession()?.conversationId ?? null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ask = useServerFn(chatbotAsk);
  const persist = useServerFn(persistChatTurn);
  const { user, loading: authLoading } = useAuth();

  // Persist to this tab's sessionStorage on every change so a page refresh
  // (not a tab close) keeps the conversation — but never touch the database
  // to rehydrate an older conversation into a fresh tab.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ conversationId: conversationIdRef.current, messages }),
      );
    } catch {
      // Storage can fail (private browsing, quota) — chat still works, just isn't persisted.
    }
  }, [messages]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const nextMsgs: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMsgs);
    setBusy(true);

    let reply: Msg;
    let intentId: string | undefined;
    // Deterministic intents are checked on every message (not just the first) so a
    // simple repeat question — "where's the menu?" mid-conversation — still gets the
    // free instant answer instead of spending a Groq call.
    const intent = matchIntent(text);
    if (intent) {
      intentId = intent.id;
      reply = { role: "assistant", content: intent.answer, actions: intent.actions };
    } else if (!user) {
      // Free-form questions need the AI, which requires a signed-in account for
      // per-user usage tracking. The input is hidden for signed-out visitors (see
      // below), so this only fires if a session expires mid-conversation.
      reply = {
        role: "assistant",
        content: "Sign in to keep chatting with me — it only takes a moment.",
        actions: [{ label: "Sign In", to: "/auth" }],
      };
    } else {
      try {
        const history = nextMsgs.slice(-8, -1).map((m) => ({ role: m.role, content: m.content }));
        const res = await ask({ data: { message: text, history } });
        reply = { role: "assistant", content: res.reply };
      } catch {
        reply = { role: "assistant", content: "I couldn't reach my brain. Try again or head to /contact." };
      }
    }

    setMessages((m) => [...m, reply]);
    setBusy(false);

    // Persist for signed-in members and anonymous visitors alike.
    try {
      const res = await persist({
        data: {
          conversationId: conversationIdRef.current,
          userMessage: text,
          assistantMessage: reply.content,
          intentId,
        },
      });
      conversationIdRef.current = res.conversationId;
      // The conversationId lives in a ref (not state), so update this tab's
      // sessionStorage copy directly here too — the messages-keyed effect
      // above already ran with the pre-persist (often null) id.
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({ conversationId: conversationIdRef.current, messages: [...nextMsgs, reply] }),
          );
        } catch {
          // ignore storage failures
        }
      }
    } catch (err) {
      console.warn("Chat persistence failed", err);
    }

  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 cursor-pointer place-items-center rounded-full bg-brand text-brand-foreground shadow-2xl ring-2 ring-cream/40 transition-transform hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[70vh] max-h-[560px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-3xl border-2 border-charcoal bg-cream text-charcoal shadow-2xl">
          <div className="flex items-center gap-3 bg-charcoal px-4 py-3 text-cream">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground">
              <ChefHat size={16} />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-sm font-black uppercase tracking-widest">Superstar</div>
              <div className="text-[10px] uppercase tracking-widest text-cream/60">Online · Ask me anything</div>
            </div>
          </div>

          <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex flex-col"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-br-sm bg-charcoal px-3 py-2 text-cream"
                      : "max-w-[90%] whitespace-pre-line rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-charcoal ring-1 ring-charcoal/10"
                  }
                >
                  {m.content}
                </div>
                {m.role === "assistant" && m.actions && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.actions.map((a, j) =>
                      a.to ? (
                        <Link
                          key={j}
                          to={a.to}
                          onClick={() => setOpen(false)}
                          className="rounded-full border border-brand bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand hover:bg-brand hover:text-brand-foreground"
                        >
                          {a.label}
                        </Link>
                      ) : (
                        <a
                          key={j}
                          href={a.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-brand bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand hover:bg-brand hover:text-brand-foreground"
                        >
                          {a.label}
                        </a>
                      ),
                    )}
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-charcoal/60">
                <Loader2 className="animate-spin" size={12} /> Thinking…
              </div>
            )}
          </div>

          {!authLoading && !user ? (
            <div className="flex items-center justify-between gap-3 border-t border-charcoal/10 bg-white p-3">
              <span className="text-xs text-charcoal/60">Sign in to ask me anything</span>
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="rounded-full bg-brand px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-foreground"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-charcoal/10 bg-white p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the menu, points, catering…"
                maxLength={500}
                className="flex-1 rounded-full border border-charcoal/15 bg-white px-4 py-2 text-sm outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground disabled:opacity-50"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
