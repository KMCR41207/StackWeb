import { createFileRoute, Link } from "@tanstack/react-router";

const title = "Admin — Stackweb";
const description = "Internal Stackweb admin area for project enquiries.";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <section className="px-5 pt-32 pb-24 sm:px-8 lg:pt-44">
      <div className="mx-auto max-w-4xl">
        <h1 className="display text-5xl sm:text-7xl">Admin</h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          Project enquiries will appear here once the site is connected to a database. Right now the
          enquiry form validates and confirms on screen, but nothing is stored.
        </p>

        <div className="mt-12 border border-hairline">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-hairline px-6 py-4">
            <p className="eyebrow">Enquiry</p>
            <p className="eyebrow">Status</p>
          </div>
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            No enquiries stored yet.
          </div>
        </div>

        <Link
          to="/"
          className="link-draw mt-10 inline-block text-[12px] tracking-[0.18em] uppercase text-primary"
        >
          Back to site
        </Link>
      </div>
    </section>
  );
}
