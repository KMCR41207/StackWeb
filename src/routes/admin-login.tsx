import { createFileRoute, useRouter } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircle, ArrowRight } from "lucide-react";
import { adminLogin } from "@/lib/auth.server";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Stackweb" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already logged in? Redirect straight to admin
  useEffect(() => {
    const token = sessionStorage.getItem("sw_admin_token");
    if (token) router.navigate({ to: "/admin" });
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    const data = new FormData(e.currentTarget);
    const username = String(data.get("username") ?? "").trim();
    const password = String(data.get("password") ?? "").trim();
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await adminLogin({ data: { username, password } });
      sessionStorage.setItem("sw_admin_token", result.token);
      await router.navigate({ to: "/admin" });
    } catch {
      setError("Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full border-b border-input bg-transparent py-3 text-lg text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary font-serif";

  return (
    <section className="flex min-h-screen items-center justify-center px-5 py-20 sm:px-8">
      <div className="w-full max-w-sm">
        <p className="display text-3xl">Stackweb</p>
        <p className="eyebrow mt-2 text-muted-foreground">Admin access</p>

        <form onSubmit={onSubmit} noValidate autoComplete="off" className="mt-10 space-y-8">
          <div>
            <label htmlFor="username" className="eyebrow block">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className={fieldClass}
              placeholder="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="eyebrow block">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={fieldClass}
              placeholder="••••••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="btn-wipe group inline-flex items-center gap-4 bg-primary px-8 py-4 text-[12px] font-medium tracking-[0.2em] text-primary-foreground uppercase disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
            {loading
              ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              : <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
            }
          </button>
        </form>
      </div>
    </section>
  );
}
