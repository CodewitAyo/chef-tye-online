import { useEffect } from "react";
import { X, ShoppingBag } from "lucide-react";
import { ORDER_URL } from "@/lib/constants";
import type { MenuItem } from "@/lib/menu-data";

type Props = {
  item: MenuItem | null;
  fullMenuImage?: string | null;
  onClose: () => void;
};

export function MenuItemDialog({ item, fullMenuImage, onClose }: Props) {
  const open = !!item || !!fullMenuImage;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-cream text-charcoal shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-charcoal/80 text-cream transition-colors hover:bg-charcoal"
        >
          <X size={18} />
        </button>

        {fullMenuImage && !item ? (
          <div className="max-h-[85vh] overflow-auto">
            <img src={fullMenuImage} alt="Full Chef Tye menu" className="w-full object-contain" />
          </div>
        ) : item ? (
          <div className="grid max-h-[85vh] grid-rows-[auto_1fr] overflow-hidden md:grid-cols-[1fr_1fr] md:grid-rows-1">
            <div className="aspect-square w-full overflow-hidden bg-charcoal md:aspect-auto md:h-full">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-cream/40">No image</div>
              )}
            </div>
            <div className="flex flex-col overflow-y-auto p-6 sm:p-8">
              {item.tag && (
                <div className="text-[10px] font-black uppercase tracking-widest text-brand">{item.tag}</div>
              )}
              <div className="mt-1 flex items-baseline justify-between gap-4">
                <h2 className="text-display text-4xl leading-tight">{item.name}</h2>
                <span className="text-display text-3xl text-brand">{item.price}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-charcoal/80">{item.full}</p>
              <div className="mt-auto pt-6">
                <a
                  href={ORDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  <ShoppingBag size={16} /> Order on Chowdeck
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
