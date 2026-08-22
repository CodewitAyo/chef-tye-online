import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Instagram, Mail, MapPin, Phone, Loader2, Send, Utensils, MessageCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { submitInquiry } from "@/lib/inquiries.functions";
import {
  CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL,
  INSTAGRAM_HANDLE_PRIMARY, INSTAGRAM_PRIMARY, X_HANDLE_PRIMARY, X_PRIMARY,
  WHATSAPP_URL, WHATSAPP_DISPLAY, LOCATION, isValidPhone, sanitizePhoneInput,
} from "@/lib/constants";
import { WhatsappIcon } from "@/components/site/WhatsappIcon";


const searchSchema = z.object({
  type: z.enum(["contact", "catering"]).optional(),
});


export const Route = createFileRoute("/contact")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Contact & Catering — Chef Tye" },
      { name: "description", content: "Reach Chef Tye for catering, private dinners, brand collaborations or press." },
      { property: "og:title", content: "Contact Chef Tye" },
      { property: "og:description", content: "Book catering, plan a private dinner, or ask about the menu." },

    ],
    links: [{ rel: "canonical", href: "https://chef-tye-online.vercel.app/contact" }],
  }),
  component: ContactPage,
});

type FormType = "contact" | "catering";

// Every identity field (name/email/phone) plus the message content lives in its own
// per-tab bucket. Nothing is shared at the top level of FormState, so switching between
// General and Catering can never leak data from one into the other (CT-CONTACT-005).
type GeneralForm = { name: string; email: string; phone: string; message: string };
type CateringForm = {
  name: string; email: string; phone: string;
  date: string; guests: string; location: string; budget: string; details: string;
};

type FormState = {
  type: FormType;
  general: GeneralForm;
  catering: CateringForm;
};

const typeMeta = {
  contact: { label: "General", icon: MessageCircle, subject: "Hey Chef Tye," },
  catering: { label: "Catering", icon: Utensils, subject: "Catering enquiry" },
} as const;

const EMPTY_GENERAL: GeneralForm = { name: "", email: "", phone: "", message: "" };
const EMPTY_CATERING: CateringForm = { name: "", email: "", phone: "", date: "", guests: "", location: "", budget: "", details: "" };

function buildCateringMessage(c: CateringForm): string {
  const lines = [
    "Hi Chef Tye, I'd love to book you for an event.",
    `Date: ${c.date}`,
    `Guests: ${c.guests}`,
  ];
  if (c.location.trim()) lines.push(`Location: ${c.location.trim()}`);
  if (c.budget.trim()) lines.push(`Budget: ${c.budget.trim()}`);
  if (c.details.trim()) lines.push("", c.details.trim());
  return lines.join("\n");
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Client-side validation so the server's Zod errors never reach the user as raw text (CT-BUG-007). */
function validationError(s: FormState): string | null {
  const active = s.type === "catering" ? s.catering : s.general;
  if (!active.name.trim()) return "Please enter your name.";
  if (!active.email.trim() || !EMAIL_PATTERN.test(active.email.trim())) return "Please enter a valid email address.";
  if (active.phone.trim() && !isValidPhone(active.phone)) {
    return "That phone number doesn't look right. Use digits, spaces, +, or ( ) only, or leave it blank.";
  }
  if (s.type === "catering") {
    if (!s.catering.date) return "Please select the event date.";
    if (!s.catering.guests.trim()) return "Please enter the number of guests.";
  } else if (!s.general.message.trim()) {
    return "Please enter a message.";
  }
  return null;
}

const KNOWN_SAFE_ERROR_MESSAGES = new Set(["Could not send message. Please try again shortly."]);

/** Differentiates connection vs. server errors and never surfaces raw/technical error text (CT-BUG-007). */
function getSubmitErrorMessage(error: unknown): string {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "You appear to be offline. Check your connection and try again.";
  }
  if (error instanceof TypeError) {
    // Browsers throw TypeError for fetch-level network failures (DNS, CORS, connection refused, etc.)
    return "Couldn't reach the server. Check your connection and try again.";
  }
  if (error instanceof Error && KNOWN_SAFE_ERROR_MESSAGES.has(error.message)) {
    return error.message;
  }
  return "Something went wrong sending your message. Please try again, or reach us directly using the contact info on this page.";
}

function ContactPage() {
  const search = Route.useSearch();
  const initialType: FormType = search.type ?? "contact";

  const [state, setState] = useState<FormState>({
    type: initialType,
    general: EMPTY_GENERAL,
    catering: EMPTY_CATERING,
  });

  const submit = useServerFn(submitInquiry);
  const mutation = useMutation({
    mutationFn: submit,
    onSuccess: () => {
      toast.success("Message sent! Chef Tye's team will try to respond within 72 hours.");
      setState((s) => ({
        ...s,
        general: s.type === "contact" ? EMPTY_GENERAL : s.general,
        catering: s.type === "catering" ? EMPTY_CATERING : s.catering,
      }));
    },
    onError: (e: unknown) => toast.error(getSubmitErrorMessage(e)),
  });

  function setType(t: FormType) {
    // Deliberately does NOT touch `general` or `catering` — each tab keeps its own
    // fully independent state so switching tabs never carries data between them (CT-CONTACT-005).
    setState((s) => ({ ...s, type: t }));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const err = validationError(state);
    if (err) {
      toast.error(err);
      return;
    }
    const active = state.type === "catering" ? state.catering : state.general;
    mutation.mutate({
      data: {
        type: state.type,
        name: active.name.trim(),
        email: active.email.trim(),
        phone: active.phone.trim(),
        subject: typeMeta[state.type].subject,
        message: state.type === "catering" ? buildCateringMessage(state.catering) : state.general.message.trim(),
      },
    });
  }

  const active = state.type === "catering" ? state.catering : state.general;

  return (
    <SiteLayout>
      <section className="bg-charcoal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">Contact</div>
          <h1 className="mt-2 text-display text-6xl leading-[0.9] sm:text-7xl md:text-8xl">
            LET'S <span className="text-brand">TALK.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Catering, private dinners, brand collabs or press. Drop a message and Chef Tye's team will try to respond within 72 hours. Looking to support Feed The Streets? Head to the donate page.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.3fr_1fr] md:py-24">
        <form onSubmit={onSubmit} className="rounded-3xl border-2 border-charcoal bg-card p-6 shadow-sm sm:p-10" noValidate>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(typeMeta) as FormType[]).map((t) => {
              const Icon = typeMeta[t].icon;
              const isActive = state.type === t;
              return (
                <button type="button" key={t} onClick={() => setType(t)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${isActive ? "bg-brand text-brand-foreground shadow" : "bg-muted text-foreground/70 hover:bg-brand/15 hover:text-brand"}`}>
                  <Icon size={14} /> {typeMeta[t].label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <input required type="text" maxLength={120} value={active.name}
                onChange={(e) => setState((s) => (s.type === "catering"
                  ? { ...s, catering: { ...s.catering, name: e.target.value } }
                  : { ...s, general: { ...s.general, name: e.target.value } }))}
                className="input" placeholder="Your name" />
            </Field>
            <Field label="Email" required>
              <input required type="email" maxLength={255} value={active.email}
                onChange={(e) => setState((s) => (s.type === "catering"
                  ? { ...s, catering: { ...s.catering, email: e.target.value } }
                  : { ...s, general: { ...s.general, email: e.target.value } }))}
                className="input" placeholder="you@email.com" />
            </Field>
            <Field label="Phone (optional)">
              <input type="tel" inputMode="tel" maxLength={40} value={active.phone}
                onChange={(e) => setState((s) => (s.type === "catering"
                  ? { ...s, catering: { ...s.catering, phone: sanitizePhoneInput(e.target.value) } }
                  : { ...s, general: { ...s.general, phone: sanitizePhoneInput(e.target.value) } }))}
                className="input" placeholder="+234 ..." />
            </Field>
            <Field label="Subject">
              <div className="input bg-muted/60 text-foreground/80">{typeMeta[state.type].subject}</div>
            </Field>

          </div>

          <div className="mt-4">
            {state.type === "catering" ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Event date" required>
                    <input required type="date" value={state.catering.date} onChange={(e) => setState({ ...state, catering: { ...state.catering, date: e.target.value } })} className="input" />
                  </Field>
                  <Field label="Guests" required>
                    <input required type="number" min={1} value={state.catering.guests} onChange={(e) => setState({ ...state, catering: { ...state.catering, guests: e.target.value } })} className="input" placeholder="e.g. 20" />
                  </Field>
                  <Field label="Location (optional)">
                    <input type="text" maxLength={200} value={state.catering.location} onChange={(e) => setState({ ...state, catering: { ...state.catering, location: e.target.value } })} className="input" placeholder="Venue / address" />
                  </Field>
                  <Field label="Budget (optional)">
                    <input type="text" maxLength={100} value={state.catering.budget} onChange={(e) => setState({ ...state, catering: { ...state.catering, budget: e.target.value } })} className="input" placeholder="e.g. ₦150,000 or flexible" />
                  </Field>
                </div>
                <Field label="Anything else? (optional)">
                  <textarea rows={4} maxLength={5000} value={state.catering.details} onChange={(e) => setState({ ...state, catering: { ...state.catering, details: e.target.value } })} className="input resize-y" placeholder="Cuisine preferences, dietary needs, occasion..." />
                </Field>
              </div>
            ) : (
              <Field label="Message" required>
                <textarea required rows={6} maxLength={5000} value={state.general.message} onChange={(e) => setState({ ...state, general: { ...state.general, message: e.target.value } })} className="input resize-y" placeholder="Tell Chef Tye what you're planning..." />
              </Field>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">We only use your details to reply. Never sold or shared.</p>
            <button type="submit" disabled={mutation.isPending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
              {mutation.isPending ? (<><Loader2 size={16} className="animate-spin" /> Sending…</>) : (<><Send size={16} /> Send Message</>)}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-charcoal p-6 text-cream sm:p-8">
            <h3 className="text-display text-2xl text-brand">Direct lines</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-brand" />
                <a href={`tel:${CONTACT_PHONE_TEL}`} className="hover:text-brand">{CONTACT_PHONE_DISPLAY}</a>
              </li>
              <li className="flex items-start gap-3">
                <WhatsappIcon size={16} className="mt-0.5 shrink-0 text-brand" />
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-brand">{WHATSAPP_DISPLAY}</a>
              </li>

              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-brand" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-brand">{CONTACT_EMAIL}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
                <span>{LOCATION}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border-2 border-charcoal bg-card p-6 sm:p-8">
            <h3 className="text-display text-2xl text-brand">Follow the kitchen</h3>
            <div className="mt-4 space-y-3">
              <a href={INSTAGRAM_PRIMARY} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-muted p-3 text-sm font-semibold transition-colors hover:bg-brand hover:text-brand-foreground">
                <Instagram size={18} /> {INSTAGRAM_HANDLE_PRIMARY}
              </a>
              <a href={X_PRIMARY} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-muted p-3 text-sm font-semibold transition-colors hover:bg-brand hover:text-brand-foreground">
                <span className="w-[18px] text-center font-bold">X</span> {X_HANDLE_PRIMARY}
              </a>
            </div>
          </div>

          <div className="rounded-3xl bg-brand p-6 text-brand-foreground sm:p-8">
            <h3 className="text-display text-2xl">Response time</h3>
            <p className="mt-2 text-sm opacity-90">We try to reply to every message within 72 hours.</p>
          </div>
        </aside>
      </section>

      <style>{`
        .input { width: 100%; border: 2px solid var(--border); background: var(--background); color: var(--foreground); border-radius: 0.75rem; padding: 0.75rem 1rem; font-size: 0.95rem; transition: border-color 150ms ease, box-shadow 150ms ease; }
        .input:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand) 20%, transparent); }
      `}</style>
    </SiteLayout>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-widest text-foreground/70">
        {label}{required && <span className="ml-1 text-brand">*</span>}
      </span>
      {children}
    </label>
  );
}
