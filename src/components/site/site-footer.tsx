import { Link } from "@tanstack/react-router";
import { ArrowUp, Instagram, Linkedin } from "lucide-react";
import { navLinks } from "@/lib/site";
import { SITE_TWITTER, SITE_INSTAGRAM, SITE_LINKEDIN } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto grid max-w-[110rem] gap-10 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="display text-5xl sm:text-7xl" aria-label="Stackweb">Stackweb</p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Custom websites built on demand for brands that care how they look.
          </p>
          <p className="mt-3 text-xs text-muted-foreground/60 tracking-[0.12em] uppercase">
            Based in India · Working globally
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-10 gap-y-6">
          <nav aria-label="Footer navigation">
            <ul className="space-y-1 text-[13px] tracking-[0.14em] uppercase sm:space-y-2">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="link-draw block py-1.5 text-foreground/80 hover:text-foreground sm:py-0">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/project-form"
                  className="link-draw block py-1.5 text-foreground/80 hover:text-foreground sm:py-0"
                >
                  Start a Project
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex flex-col gap-1 sm:gap-3">
            <a
              href={SITE_INSTAGRAM}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Stackweb on Instagram"
              className="inline-flex items-center gap-2 py-1.5 text-[13px] tracking-[0.14em] uppercase text-foreground/80 hover:text-primary sm:py-0"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
              Instagram
            </a>
            <a
              href={SITE_TWITTER}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Stackweb on Twitter / X"
              className="inline-flex items-center gap-2 py-1.5 text-[13px] tracking-[0.14em] uppercase text-foreground/80 hover:text-primary sm:py-0"
            >
              Twitter / X
            </a>
            <a
              href={SITE_LINKEDIN}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Stackweb on LinkedIn"
              className="inline-flex items-center gap-2 py-1.5 text-[13px] tracking-[0.14em] uppercase text-foreground/80 hover:text-primary sm:py-0"
            >
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[110rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-hairline px-5 py-5 text-xs text-muted-foreground sm:px-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <p>© {new Date().getFullYear()} Stackweb. All rights reserved.</p>
          <Link
            to="/privacy-policy"
            className="tracking-[0.12em] uppercase transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-of-service"
            className="tracking-[0.12em] uppercase transition-colors hover:text-foreground"
          >
            Terms of Service
          </Link>
        </div>
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
