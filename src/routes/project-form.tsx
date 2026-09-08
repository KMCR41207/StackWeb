import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { MaskedLinesOnScroll, Rise } from "@/components/site/motion-primitives";
import { submitProjectEnquiry } from "@/lib/enquiries.server";

const title = "Start a Project — Stackweb";
const description =
  "Tell Stackweb about your website project: scope, budget and timeline. We reply within one working day.";

export const Route = createFileRoute("/project-form")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ProjectFormPage,
});

const fieldClass =
  "w-full border-b border-input bg-transparent py-3 text-lg text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary";

const projectTypes = [
  "Marketing site",
  "E-commerce",
  "Product / app UI",
  "Redesign of an existing site",
  "Something else",
];
const budgets = ["Under $2k", "$2k – $5k", "$5k – $15k", "$15k+", "Not sure yet"];
const timelines = ["ASAP", "2–4 weeks", "1–2 months", "Just planning"];

function ProjectFormPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const projectType = String(data.get("type") ?? "").trim();
    const budget = String(data.get("budget") ?? "").trim();
    const timeline = String(data.get("timeline") ?? "").trim();
    const details = String(data.get("details") ?? "").trim();

    if (!name || !email || !details) {
      setError("Please fill in your name, email and a little about the project.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email address doesn't look right.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await submitProjectEnquiry({
        data: { name, company, email, projectType, budget, timeline, details },
      });
      setSent(true);
    } catch {
      setError("We couldn't send your enquiry. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="px-5 pt-32 pb-24 sm:px-8 lg:pt-44">
      <div className="mx-auto grid max-w-[110rem] gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h1 className="display text-[clamp(2.6rem,8vw,7rem)]">
            <MaskedLinesOnScroll lines={["Start a", "project"]} />
          </h1>
          <Rise delay={0.2}>
            <p className="mt-6 max-w-md font-serif text-2xl leading-snug text-foreground/85">
              Tell us what you're building. We read every enquiry ourselves and reply within one
              working day.
            </p>
          </Rise>
        </div>

        {sent ? (
          <div className="flex flex-col justify-center border border-hairline bg-surface p-10">
            <Check className="h-10 w-10 text-primary" aria-hidden="true" />
            <h2 className="display mt-6 text-4xl sm:text-5xl">Thanks — got it</h2>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Your enquiry is in front of us. Expect a reply within one working day with next steps
              and a rough schedule.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-10">
            <div className="grid gap-10 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="eyebrow block">
                  Your name
                </label>
                <input id="name" name="name" className={fieldClass} placeholder="Jane Doe" />
              </div>
              <div>
                <label htmlFor="company" className="eyebrow block">
                  Company
                </label>
                <input id="company" name="company" className={fieldClass} placeholder="Optional" />
              </div>
              <div>
                <label htmlFor="email" className="eyebrow block">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={fieldClass}
                  placeholder="jane@company.com"
                />
              </div>
              <div>
                <label htmlFor="type" className="eyebrow block">
                  Project type
                </label>
                <select id="type" name="type" className={`${fieldClass} appearance-none`}>
                  {projectTypes.map((t) => (
                    <option key={t} value={t} className="bg-background">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="budget" className="eyebrow block">
                  Budget
                </label>
                <select id="budget" name="budget" className={`${fieldClass} appearance-none`}>
                  {budgets.map((b) => (
                    <option key={b} value={b} className="bg-background">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="timeline" className="eyebrow block">
                  Timeline
                </label>
                <select id="timeline" name="timeline" className={`${fieldClass} appearance-none`}>
                  {timelines.map((t) => (
                    <option key={t} value={t} className="bg-background">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="details" className="eyebrow block">
                About the project
              </label>
              <textarea
                id="details"
                name="details"
                rows={5}
                className={`${fieldClass} resize-none`}
                placeholder="What are you building, and what does success look like?"
              />
            </div>

            {error && (
              <p role="alert" aria-live="polite" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="btn-wipe group inline-flex items-center gap-4 bg-primary px-8 py-4 text-[12px] font-medium tracking-[0.2em] text-primary-foreground uppercase"
            >
              {submitting ? "Sending enquiry" : "Send enquiry"}
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5"
                  aria-hidden="true"
                />
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
