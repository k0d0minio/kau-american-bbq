import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const safeFrom = from?.startsWith("/admin") ? from : undefined;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-char-900 px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="font-display text-3xl text-bone">Vine Cliff</p>
          <p className="mt-1 eyebrow text-ember-soft">Estate Admin</p>
        </div>

        <div className="mt-8 rounded-3xl bg-bone p-7 shadow-lift sm:p-8">
          <h1 className="font-display text-2xl text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-ink-soft">
            This area is private to the estate owners.
          </p>
          <div className="mt-6">
            <LoginForm from={safeFrom} />
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-bone/70 transition-colors hover:text-bone"
          >
            <ArrowLeft className="size-4" />
            Back to the website
          </Link>
        </div>
      </div>
    </main>
  );
}
