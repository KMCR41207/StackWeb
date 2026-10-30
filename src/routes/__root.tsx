import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, useCallback, lazy, Suspense, type ReactNode } from "react";

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
          "Stackweb is a web design studio building custom, high-performance websites. Fixed price, fast delivery.",
      },
      { name: "author", content: "Stackweb" },
      { property: "og:title", content: "Stackweb — Custom websites, built on demand" },
      {
        property: "og:description",
        content:
          "Stackweb is a web design studio building custom, high-performance websites. Fixed price, fast delivery.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://stackweb.net" },
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
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
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
        {/* Pre-paint Obsidian overlay to prevent flash before intro loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname;if(p!=="/")return;var s=sessionStorage.getItem("sw-intro-played");var u=new URLSearchParams(location.search);if(u.get("intro")==="0")return;if(s==="1"&&u.get("intro")!=="1")return;if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches)return;var d=document.createElement("div");d.id="sw-intro-precover";d.style.cssText="position:fixed;inset:0;z-index:99997;background:#080B12;pointer-events:none;";document.body.appendChild(d)}catch(e){}})();`,
          }}
        />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm">
          Skip to content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// Lazy-load the intro to keep the critical bundle small
const LazyIntroOverlay = lazy(() =>
  import("@/components/site/intro/intro-overlay").then((m) => ({
    default: m.IntroOverlay,
  }))
);

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Always false on server to avoid hydration mismatch; set true on client mount
  const [introActive, setIntroActive] = useState(false);

  useEffect(() => {
    if (pathname === "/") {
      setIntroActive(true);
    }
    // Only run once on mount — pathname at mount time determines intro
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroActive(false);
    // Remove the pre-paint cover
    const cover = document.getElementById("sw-intro-precover");
    if (cover) cover.remove();
  }, []);

  useEffect(() => {
    // If not on homepage, remove precover immediately
    if (pathname !== "/") {
      const cover = document.getElementById("sw-intro-precover");
      if (cover) cover.remove();
    }
  }, [pathname]);

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
      {introActive && pathname === "/" && (
        <Suspense fallback={null}>
          <LazyIntroOverlay onComplete={handleIntroComplete} />
        </Suspense>
      )}
      <SiteNav />
      <main id="main">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </main>
      <SiteFooter />
    </QueryClientProvider>
  );
}
