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

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0b0b0d" },
      { title: "Stackweb — Custom websites, built on demand" },
      {
        name: "description",
        content:
          "Stackweb is a web design studio building custom, high-performance websites for brands that care how they look.",
      },
      { name: "author", content: "Stackweb" },
      { property: "og:title", content: "Stackweb — Custom websites, built on demand" },
      {
        property: "og:description",
        content:
          "Stackweb is a web design studio building custom, high-performance websites for brands that care how they look.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://stackweb.net/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=Instrument+Serif:ital@0;1&display=swap",
      },
      { rel: "icon", type: "image/svg+xml", href: "data:image/svg+xml,%3Csvg%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2240%22%20height%3D%2240%22%20rx%3D%224%22%20fill%3D%22%230b0b0d%22%2F%3E%3Crect%20x%3D%227%22%20y%3D%227%22%20width%3D%2226%22%20height%3D%227%22%20fill%3D%22%233457ff%22%2F%3E%3Crect%20x%3D%2213%22%20y%3D%2219.5%22%20width%3D%2220%22%20height%3D%227%22%20fill%3D%22%233457ff%22%2F%3E%3Crect%20x%3D%2219%22%20y%3D%2232%22%20width%3D%2214%22%20height%3D%227%22%20fill%3D%22%233457ff%22%2F%3E%3C%2Fsvg%3E" },
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
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm">
          Skip to content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const remove = () => {
      // Walk all direct children of body — badge is always appended there
      document.querySelectorAll("body > *").forEach((el) => {
        // Check the element itself or any anchor inside it
        const anchors = [el, ...el.querySelectorAll("a")];
        for (const a of anchors) {
          if (a instanceof HTMLAnchorElement && a.href.includes("lovable")) {
            el.remove();
            return;
          }
        }
        // Also remove any fixed/absolute element with no semantic role that looks like a badge
        const style = window.getComputedStyle(el);
        if (
          (style.position === "fixed" || style.position === "absolute") &&
          el.tagName !== "SCRIPT" &&
          el.id !== "main" &&
          !el.closest("header, main, footer, nav")
        ) {
          const text = el.textContent?.toLowerCase() ?? "";
          if (text.includes("lovable") || text.includes("edit with")) {
            el.remove();
          }
        }
      });
    };

    // Run immediately and on DOM mutations (badge may inject after load)
    remove();
    const observer = new MutationObserver(remove);
    observer.observe(document.body, { childList: true, subtree: false });
    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SiteNav />
      <main id="main">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </main>
      <SiteFooter />
    </QueryClientProvider>
  );
}
