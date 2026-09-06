import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled
          ? "border-b border-hairline bg-background/85 backdrop-blur-md"
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
          onClick={() => setOpen(false)}
        >
          Stackweb
        </Link>

        <div className="flex shrink-0 items-center gap-8">
          <ul className="hidden items-center gap-8 text-[13px] tracking-[0.14em] uppercase md:flex">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="link-draw text-foreground/80 hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to="/project-form"
            className="btn-wipe hidden bg-primary px-5 py-2.5 text-[12px] font-medium tracking-[0.16em] text-primary-foreground uppercase sm:inline-block"
          >
            Start a Project
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="text-foreground md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-hairline bg-background px-5 pb-8 md:hidden">
          <ul className="display space-y-2 pt-6 text-4xl">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={() => setOpen(false)} className="block">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/project-form"
                onClick={() => setOpen(false)}
                className="block text-primary"
              >
                Start a Project
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
