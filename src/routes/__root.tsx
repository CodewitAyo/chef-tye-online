import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ScrollToTop } from "@/components/site/ScrollToTop";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Chatbot } from "@/components/site/Chatbot";

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="grain-bg flex min-h-[70vh] items-center justify-center px-4 py-24">
        <div className="max-w-md text-center">
          <div className="text-display text-[9rem] leading-none text-brand">404</div>
          <h1 className="mt-2 text-display text-4xl text-foreground">Page not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Looks like this plate wandered off. Let's get you back to the kitchen.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-primary">Back Home</Link>
            <Link to="/menu" className="btn-outline">See The Menu</Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <SiteLayout>
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-24">
        <div className="max-w-md text-center">
          <h1 className="text-display text-3xl text-foreground">Something burned in the kitchen</h1>
          <p className="mt-3 text-sm text-muted-foreground">Try again in a moment, or head back to the homepage.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => { router.invalidate(); reset(); }} className="btn-primary">Try Again</button>
            <a href="/" className="btn-outline">Go Home</a>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Chef Tye — Private Chef in Lagos | Thank You Earth" },
      {
        name: "description",
        content:
          "Chef Tye is a Lagos-based private chef serving bold pasta, rice bowls and stir-fries. Order on Chowdeck, book catering, and support the Feed The Streets charity.",
      },
      { name: "theme-color", content: "#E63946" },
      { property: "og:title", content: "Chef Tye — Private Chef in Lagos" },
      {
        property: "og:description",
        content: "Signature Holy Grail pasta, ASAP, Obiageli and more — cooked with soul in Lagos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=Kaushan+Script&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTop />
      <Outlet />
      <Chatbot />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
