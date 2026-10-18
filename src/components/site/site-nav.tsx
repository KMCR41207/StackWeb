import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Scroll listener — passive, no layout thrash
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-hairline bg-background/90 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto grid max-w-[110rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8 lg:py-5"
      >
        <Link
          to="/"
          className="display min-w-0 truncate text-xl tracking-[0.06em] sm:text-2xl"
          aria-label="Stackweb — home"
          onClick={() => setOpen(false)}
        >
          Stackweb
        </Link>

        <div className="flex shrink-0 items-center gap-6 sm:gap-8">
          {/* Desktop nav links */}
          <ul className="hidden items-center gap-8 text-[13px] tracking-[0.14em] uppercase md:flex">
            {navLinks.map((l) => {
              const isActive = pathname === l.to || pathname.startsWith(l.to + "/");
              return (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={cn(
                      "link-draw py-1",
                      isActive ? "text-foreground" : "text-foreground/80 hover:text-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            to="/project-form"
            className="btn-wipe hidden bg-primary px-5 py-2.5 text-[12px] font-medium tracking-[0.16em] text-primary-foreground uppercase sm:inline-block"
          >
            Start a Project
          </Link>

          {/* Hamburger — 44×44 tap target */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center text-foreground md:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  <X className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -45, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Menu className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile menu — animated slide down */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-hairline bg-background/95 backdrop-blur-md md:hidden"
            style={{ willChange: "opacity, transform" }}
          >
            <ul className="display space-y-1 px-5 pt-6 pb-8 text-[clamp(2rem,9vw,3.5rem)]">
              {navLinks.map((l) => {
                const isActive = pathname === l.to || pathname.startsWith(l.to + "/");
                return (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className={cn(
                        "block py-2 transition-colors duration-150",
                        isActive ? "text-primary" : "text-foreground/90 hover:text-foreground",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2 border-t border-hairline mt-4">
                <Link
                  to="/project-form"
                  className="block py-2 text-primary"
                >
                  Start a Project →
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
