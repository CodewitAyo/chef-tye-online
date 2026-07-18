import { Link } from "@tanstack/react-router";
import { Instagram, Phone, Mail, MapPin, Bike } from "lucide-react";
import logoAsset from "@/assets/chef-tye-logo.png.asset.json";
import andominusAsset from "@/assets/andominus-logo.png.asset.json";
import { WhatsappIcon } from "@/components/site/WhatsappIcon";
import {
  ORDER_URL,
  INSTAGRAM_PRIMARY,
  INSTAGRAM_HANDLE_PRIMARY,
  X_PRIMARY,
  X_HANDLE_PRIMARY,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  WHATSAPP_URL,
  WHATSAPP_DISPLAY,
  CONTACT_EMAIL,
  LOCATION,
  MAPS_URL,
} from "@/lib/constants";


export function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src={logoAsset.url}
              alt="Chef Tye logo"
              className="h-12 w-12 rounded-full bg-cream ring-2 ring-brand"
            />
            <div>
              <div className="text-display text-2xl">CHEF TYE</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand">
                Private Chef · Lagos
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/70">
            A private chef from Lagos serving bold, soul-warming plates. Every meal hand-prepared by Chef Tye himself.
          </p>
        </div>

        <div>
          <h4 className="text-display text-lg text-brand">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/story", label: "The Story" },
              { to: "/menu", label: "The Menu" },
              { to: "/join", label: "Join The Elites" },
              { to: "/charity", label: "Feed The Streets" },
              { to: "/contact", label: "Contact & Catering" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-cream/80 transition-colors hover:text-brand">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-display text-lg text-brand">Order & Follow</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Bike size={14} className="text-brand" />
              <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" className="text-cream/80 transition-colors hover:text-brand">
                Chowdeck — Chef Tye
              </a>
            </li>

            <li className="flex items-center gap-2">
              <Instagram size={14} className="text-brand" />
              <a href={INSTAGRAM_PRIMARY} target="_blank" rel="noopener noreferrer" className="text-cream/80 transition-colors hover:text-brand">
                {INSTAGRAM_HANDLE_PRIMARY}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand font-bold">X</span>
              <a href={X_PRIMARY} target="_blank" rel="noopener noreferrer" className="text-cream/80 transition-colors hover:text-brand">
                {X_HANDLE_PRIMARY}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-display text-lg text-brand">Reach Out</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-brand" />
              <a href={`tel:${CONTACT_PHONE_TEL}`} className="text-cream/80 transition-colors hover:text-brand">
                {CONTACT_PHONE_DISPLAY}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <WhatsappIcon size={14} className="text-brand" />
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-cream/80 transition-colors hover:text-brand">
                {WHATSAPP_DISPLAY}
              </a>
            </li>

            <li className="flex items-center gap-2">
              <Mail size={14} className="text-brand" />
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cream/80 transition-colors hover:text-brand">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} className="text-brand" />
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-cream/80 transition-colors hover:text-brand" title="View on Google Maps">
                {LOCATION}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-cream/50 sm:flex-row sm:px-8">
          <span>© {new Date().getFullYear()} Chef Tye. All rights reserved.</span>
          <span className="uppercase tracking-widest">There'll Be Round 2.</span>
          <div className="flex items-center gap-2 text-cream/60">
            <span className="text-[10px] uppercase tracking-[0.25em]">Built by</span>
            <img
              src={andominusAsset.url}
              alt="Andominus logo"
              className="h-7 w-7 rounded-full object-cover ring-1 ring-cream/20"
            />
            <span className="text-[11px] font-semibold tracking-widest text-cream/80">ANDOMINUS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
