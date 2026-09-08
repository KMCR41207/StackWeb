import { createFileRoute, Link } from "@tanstack/react-router";
import { getEnquiries } from "@/lib/enquiries.server";

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
  loader: async () => {
    try {
      return { enquiries: await getEnquiries() };
    } catch {
      return { enquiries: [] };
    }
  },
  component: AdminPage,
});

function AdminPage() {
  const { enquiries } = Route.useLoaderData();

  return (
    <section className="px-5 pt-32 pb-24 sm:px-8 lg:pt-44">
      <div className="mx-auto max-w-4xl">
        <h1 className="display text-5xl sm:text-7xl">Admin</h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          Project enquiries submitted through the site.
        </p>

        <div className="mt-12 border border-hairline">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-hairline px-6 py-4">
            <p className="eyebrow">Name / Email</p>
            <p className="eyebrow">Project type</p>
            <p className="eyebrow">Status</p>
          </div>

          {enquiries.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              No enquiries stored yet.
            </div>
          ) : (
            <ul>
              {enquiries.map((e: {
                id: string; name: string; company: string; email: string;
                project_type: string; budget: string; timeline: string;
                details: string; created_at: string; status: string;
              }, i: number) => (
                <li
                  key={e.id}
                  className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 px-6 py-5 text-sm${
                    i < enquiries.length - 1 ? " border-b border-hairline" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{e.name}</p>
                    {e.company && (
                      <p className="truncate text-muted-foreground">{e.company}</p>
                    )}
                    <p className="truncate text-muted-foreground">{e.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      {new Date(e.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-foreground/80">{e.project_type}</p>
                    <p className="truncate text-muted-foreground">{e.budget}</p>
                    <p className="truncate text-muted-foreground">{e.timeline}</p>
                  </div>
                  <div>
                    <span
                      className={`eyebrow inline-block px-2 py-1 text-[10px] ${
                        e.status === "New"
                          ? "bg-primary/10 text-primary"
                          : e.status === "In progress"
                            ? "bg-foreground/10 text-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {e.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
