import { Link } from "@tanstack/react-router";
import { ArrowUp, Instagram } from "lucide-react";
import { navLinks } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto grid max-w-[110rem] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="display text-5xl sm:text-7xl">Stackweb</p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Custom websites built on demand for brands that care how they look.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-10 gap-y-6">
          <ul className="space-y-2 text-[13px] tracking-[0.14em] uppercase">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="link-draw text-foreground/80 hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/project-form" className="link-draw text-foreground/80 hover:text-foreground">
                Start a Project
              </Link>
            </li>
          </ul>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 text-[13px] tracking-[0.14em] uppercase text-foreground/80 hover:text-primary"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
            Instagram
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-[110rem] items-center justify-between gap-4 border-t border-hairline px-5 py-5 text-xs text-muted-foreground sm:px-8">
        <p>© {new Date().getFullYear()} Stackweb. All rights reserved.</p>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group inline-flex items-center gap-2 tracking-[0.14em] uppercase hover:text-foreground"
        >
          Back to top
          <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-1" />
        </button>
      </div>
    </footer>
  );
}
