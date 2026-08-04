"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, Button } from "@/components/ui";
import { useAppState } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? "Unable to sign in.");
      return;
    }
    router.push("/dashboard");
  }

  function handleDemo() {
    loginDemo();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <h1 className="text-xl font-bold text-navy-900">Sign in to JusticeChamp</h1>
            <p className="text-sm text-navy-700 mt-1">Access your claims, documents, and lawyer matches.</p>

            <Button variant="cta" className="w-full mt-6" onClick={handleDemo} type="button">
              Continue with demo account
            </Button>
            <p className="text-xs text-navy-700/70 text-center mt-2">Instantly loads sample claims, documents, and scores — no signup required.</p>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-navy-900/10 flex-1" />
              <span className="text-xs text-navy-700">or sign in with email</span>
              <div className="h-px bg-navy-900/10 flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-navy-900" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-navy-900" htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="text-xs text-teal-600 hover:underline">Forgot password?</Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full">Sign in</Button>
            </form>

            <p className="text-sm text-navy-700 mt-6 text-center">
              New to JusticeChamp?{" "}
              <Link href="/signup" className="text-teal-600 font-medium hover:underline">Create an account</Link>
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
