import { Clock } from "lucide-react";
import { REGULAR_MENU_HOURS } from "@/lib/constants";

type RegularHoursProps = {
  /** Visual theme: "dark" for use on charcoal/brand backgrounds, "light" for use on cream/card backgrounds. */
  variant?: "dark" | "light";
  className?: string;
};

/** Shared "Regular Menu Hours" block used on the Home and Menu pages. */
export function RegularHours({ variant = "light", className = "" }: RegularHoursProps) {
  const isDark = variant === "dark";
  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 ${
        isDark ? "bg-cream/5 ring-1 ring-cream/15 text-cream" : "bg-card ring-1 ring-border text-foreground"
      } ${className}`}
    >
      <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${isDark ? "text-brand" : "text-brand"}`}>
        <Clock size={14} /> Regular Menu Hours
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {REGULAR_MENU_HOURS.map((row) => (
          <li key={row.days} className="flex items-center justify-between gap-4">
            <span className={isDark ? "text-cream/80" : "text-muted-foreground"}>{row.days}</span>
            <span className={`font-semibold ${row.hours === "Closed" ? (isDark ? "text-cream/50" : "text-muted-foreground") : ""}`}>
              {row.hours}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
