import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Instagram, Mail, MapPin, Phone, Loader2, Send, Heart, Utensils, MessageCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { submitInquiry } from "@/lib/inquiries.functions";
import {
  CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL,
  INSTAGRAM_HANDLE_PRIMARY, INSTAGRAM_PRIMARY, X_HANDLE_PRIMARY, X_PRIMARY,
  WHATSAPP_URL, WHATSAPP_DISPLAY, LOCATION,
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
      { name: "description", content: "Reach Chef Tye for catering, private dinners, brand collaborations, or Feed The Streets donations." },
      { property: "og:title", content: "Contact Chef Tye" },
      { property: "og:description", content: "Book catering, ask about the menu, or support Feed The Streets." },
    ],
  }),
  component: ContactPage,
});

type FormState = {
  type: "contact" | "catering";
  name: string; email: string; phone: string; subject: string; message: string;
};

const typeMeta = {
  contact: { label: "General", icon: MessageCircle, subject: "Hey Chef Tye,", message: "" },
  catering: { label: "Catering", icon: Utensils, subject: "Catering enquiry", message: "Hi Chef Tye, I'd love to book you for an event.\nDate:\nGuests:\nLocation:\nBudget:\n" },
} as const;

function ContactPage() {
  const search = Route.useSearch();
  const initialType: FormState["type"] = search.type ?? "contact";

  const [state, setState] = useState<FormState>({
    type: initialType,
    name: "", email: "", phone: "",
    subject: typeMeta[initialType].subject,
    message: typeMeta[initialType].message,
  });

  const submit = useServerFn(submitInquiry);
  const mutation = useMutation({
    mutationFn: submit,
    onSuccess: () => {
      toast.success("Message sent! Chef Tye's team will respond within 24 hours.");
      setState((s) => ({ ...s, message: "", subject: typeMeta[s.type].subject }));
    },
    onError: (e: Error) => toast.error(e.message || "Something went wrong."),
  });

  function setType(t: FormState["type"]) {
    setState((s) => ({
      ...s,
      type: t,
      subject: typeMeta[t].subject,
      message: s.message === typeMeta[s.type].message ? typeMeta[t].message : s.message,
    }));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutation.mutate({
      data: {
        type: state.type,
        name: state.name.trim(),
        email: state.email.trim(),
        phone: state.phone.trim(),
        subject: state.subject.trim(),
        message: state.message.trim(),
      },
    });
  }



  return (
    <SiteLayout>
      <section className="bg-charcoal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-brand">Contact</div>
          <h1 className="mt-2 text-display text-6xl leading-[0.9] sm:text-7xl md:text-8xl">
            LET'S <span className="text-brand">TALK.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Catering, private dinners, brand collabs, press, or a donation to Feed The Streets. Drop a message and Chef Tye's team will respond within 24 hours.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.3fr_1fr] md:py-24">
        <form onSubmit={onSubmit} className="rounded-3xl border-2 border-charcoal bg-card p-6 shadow-sm sm:p-10" noValidate>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(typeMeta) as Array<FormState["type"]>).map((t) => {
              const Icon = typeMeta[t].icon;
              const active = state.type === t;
              return (
                <button type="button" key={t} onClick={() => setType(t)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${active ? "bg-brand text-brand-foreground shadow" : "bg-muted text-foreground/70 hover:bg-brand/15 hover:text-brand"}`}>
                  <Icon size={14} /> {typeMeta[t].label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <input required type="text" maxLength={120} value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} className="input" placeholder="Your name" />
            </Field>
            <Field label="Email" required>
              <input required type="email" maxLength={255} value={state.email} onChange={(e) => setState({ ...state, email: e.target.value })} className="input" placeholder="you@email.com" />
            </Field>
            <Field label="Phone (optional)">
              <input type="tel" maxLength={40} value={state.phone} onChange={(e) => setState({ ...state, phone: e.target.value })} className="input" placeholder="+234 ..." />
            </Field>
            <Field label={state.type === "donation" ? "Donation amount (₦)" : "Subject"}>
              {state.type === "donation" ? (
                <input type="number" min={0} step={500} value={state.amount} onChange={(e) => setState({ ...state, amount: e.target.value })} className="input" placeholder="e.g. 15000" />
              ) : (
                <input type="text" maxLength={200} value={state.subject} onChange={(e) => setState({ ...state, subject: e.target.value })} className="input" placeholder="Subject" />
              )}
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Message" required>
              <textarea required rows={6} maxLength={5000} value={state.message} onChange={(e) => setState({ ...state, message: e.target.value })} className="input resize-y" placeholder="Tell Chef Tye what you're planning..." />
            </Field>
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
