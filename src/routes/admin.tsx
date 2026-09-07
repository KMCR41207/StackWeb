import { createFileRoute, Link, useRouter, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Mail, RefreshCw, LogOut } from "lucide-react";
import { getEnquiries, updateEnquiryStatus } from "@/lib/enquiries.server";
import { validateAdminToken } from "@/lib/auth.server";

const title = "Admin — Stackweb";
const description = "Internal Stackweb admin area for project enquiries.";

type Enquiry = {
  id: string;
  name: string;
  company: string;
  email: string;
  project_type: string;
  budget: string;
  timeline: string;
  details: string;
  created_at: string;
  status: string;
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async () => {
    try {
      return { enquiries: await getEnquiries() as Enquiry[], error: null };
    } catch (e) {
      return { enquiries: [] as Enquiry[], error: e instanceof Error ? e.message : "Failed to load" };
    }
  },
  component: AdminPage,
});

const statusColour: Record<string, string> = {
  "New":         "bg-primary/10 text-primary",
  "In progress": "bg-yellow-500/10 text-yellow-400",
  "Closed":      "bg-muted text-muted-foreground",
};

function EnquiryRow({ e, onStatusChange }: { e: Enquiry; onStatusChange: (id: string, s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleStatus(status: "New" | "In progress" | "Closed") {
    setUpdating(true);
    try {
      await updateEnquiryStatus({ data: { id: e.id, status } });
      onStatusChange(e.id, status);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <li className="border-b border-hairline last:border-0">
      {/* Summary row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_32px] items-center gap-4 px-6 py-5 text-left text-sm transition-colors hover:bg-surface"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{e.name}</p>
          {e.company && <p className="truncate text-muted-foreground">{e.company}</p>}
          <p className="truncate text-xs text-muted-foreground/70">{e.email}</p>
        </div>
        <div className="min-w-0">
          <p className="truncate text-foreground/80">{e.project_type}</p>
          <p className="truncate text-xs text-muted-foreground">{e.budget}</p>
          <p className="truncate text-xs text-muted-foreground">{e.timeline}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`eyebrow inline-block px-2 py-1 text-[10px] ${statusColour[e.status] ?? "bg-muted text-muted-foreground"}`}>
            {e.status}
          </span>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded detail panel */}
      {open && (
        <div className="border-t border-hairline bg-surface px-6 py-6">
          <div className="grid gap-8 sm:grid-cols-2">
            {/* Contact info */}
            <div>
              <p className="eyebrow mb-3">Contact</p>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-muted-foreground">Name</dt>
                  <dd className="text-foreground">{e.name}</dd>
                </div>
                {e.company && (
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-muted-foreground">Company</dt>
                    <dd className="text-foreground">{e.company}</dd>
                  </div>
                )}
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-muted-foreground">Email</dt>
                  <dd>
                    <a href={`mailto:${e.email}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline">
                      <Mail className="h-3 w-3" />
                      {e.email}
                    </a>
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-muted-foreground">Received</dt>
                  <dd className="text-foreground">
                    {new Date(e.created_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Project info */}
            <div>
              <p className="eyebrow mb-3">Project</p>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-muted-foreground">Type</dt>
                  <dd className="text-foreground">{e.project_type}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-muted-foreground">Budget</dt>
                  <dd className="text-foreground">{e.budget}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-muted-foreground">Timeline</dt>
                  <dd className="text-foreground">{e.timeline}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Details */}
          <div className="mt-6">
            <p className="eyebrow mb-2">About the project</p>
            <p className="max-w-2xl text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {e.details}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="eyebrow mr-2">Update status:</p>
            {(["New", "In progress", "Closed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                disabled={updating || e.status === s}
                onClick={() => handleStatus(s)}
                className={`border px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase transition-colors disabled:opacity-40 ${
                  e.status === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-hairline text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
            {updating && <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}

            <a
              href={`mailto:${e.email}?subject=Re: Your Stackweb project enquiry&body=Hi ${e.name},%0D%0A%0D%0AThank you for reaching out to Stackweb.%0D%0A%0D%0A`}
              className="ml-auto inline-flex items-center gap-2 border border-primary px-4 py-1.5 text-[11px] tracking-[0.14em] uppercase text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              Reply by email
            </a>
          </div>
        </div>
      )}
    </li>
  );
}

function AdminPage() {
  const { enquiries: initial, error } = Route.useLoaderData();
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initial);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Client-side auth check — redirect to login if no valid token
  useEffect(() => {
    const token = sessionStorage.getItem("sw_admin_token");
    if (!token) {
      router.navigate({ to: "/admin-login" });
      return;
    }
    validateAdminToken({ data: { token } }).then((res) => {
      if (!res.authenticated) {
        sessionStorage.removeItem("sw_admin_token");
        router.navigate({ to: "/admin-login" });
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  function handleStatusChange(id: string, status: string) {
    setEnquiries((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
  }

  function handleSignOut() {
    sessionStorage.removeItem("sw_admin_token");
    router.navigate({ to: "/admin-login" });
  }

  if (!authChecked) {
    return (
      <section className="flex min-h-screen items-center justify-center">
        <p className="eyebrow text-muted-foreground">Verifying access…</p>
      </section>
    );
  }

  const counts = {
    total: enquiries.length,
    new: enquiries.filter((e) => e.status === "New").length,
    inProgress: enquiries.filter((e) => e.status === "In progress").length,
    closed: enquiries.filter((e) => e.status === "Closed").length,
  };

  return (
    <section className="px-5 pt-32 pb-24 sm:px-8 lg:pt-44">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="display text-5xl sm:text-7xl">Admin</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Project enquiries — internal use only.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.invalidate()}
              className="inline-flex items-center gap-2 border border-hairline px-4 py-2 text-[11px] tracking-[0.14em] uppercase text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 border border-hairline px-4 py-2 text-[11px] tracking-[0.14em] uppercase text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total", value: counts.total },
            { label: "New", value: counts.new, accent: true },
            { label: "In progress", value: counts.inProgress },
            { label: "Closed", value: counts.closed },
          ].map((s) => (
            <div key={s.label} className="border border-hairline px-5 py-4">
              <dt className="eyebrow">{s.label}</dt>
              <dd className={`mt-1 text-3xl font-light ${s.accent ? "text-primary" : "text-foreground"}`}>
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Error state */}
        {error && (
          <div className="mt-8 border border-destructive/40 bg-destructive/10 px-6 py-4 text-sm text-destructive">
            Database error: {error}
          </div>
        )}

        {/* Table */}
        <div className="mt-8 border border-hairline">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_32px] gap-4 border-b border-hairline px-6 py-3">
            <p className="eyebrow">Name / Contact</p>
            <p className="eyebrow">Project</p>
            <p className="eyebrow">Status</p>
            <div />
          </div>

          {enquiries.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              {error ? "Could not load enquiries." : "No enquiries yet."}
            </div>
          ) : (
            <ul>
              {enquiries.map((e) => (
                <EnquiryRow key={e.id} e={e} onStatusChange={handleStatusChange} />
              ))}
            </ul>
          )}
        </div>

        <Link to="/" className="link-draw mt-10 inline-block text-[12px] tracking-[0.18em] uppercase text-primary">
          Back to site
        </Link>
      </div>
    </section>
  );
}
