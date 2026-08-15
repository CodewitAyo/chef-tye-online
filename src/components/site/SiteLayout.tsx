import type { ReactNode } from "react";
import { ShoppingBag } from "lucide-react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { ORDER_URL } from "@/lib/constants";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Nav />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <a
        href={ORDER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 bg-brand px-4 py-3.5 text-sm font-black uppercase tracking-widest text-brand-foreground shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)] lg:hidden"
      >
        <ShoppingBag size={16} /> Order Now
      </a>
    </div>
  );
}
