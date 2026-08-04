"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, Button } from "@/components/ui";
import { useAppState } from "@/lib/store";

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginDemo } = useAppState();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [consentComms, setConsentComms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreeTerms) {
      setError("You must acknowledge the Terms of Service and Privacy Policy to continue.");
      return;
    }
    const result = signup(fullName, email, password, confirmPassword);
    if (!result.ok) {
      setError(result.error ?? "Unable to create account.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <h1 className="text-xl font-bold text-navy-900">Create your JusticeChamp account</h1>
            <p className="text-sm text-navy-700 mt-1">Start documenting your situation in a few minutes.</p>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium text-navy-900" htmlFor="fullName">Full name</label>
                <input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-navy-900" htmlFor="email">Email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-navy-900" htmlFor="password">Password</label>
                <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-navy-900" htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
              </div>

              <label className="flex items-start gap-2 text-xs text-navy-700">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5" />
                I acknowledge the <Link href="/terms" className="text-teal-600 hover:underline">Terms of Service</Link> and{" "}
                <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>.
              </label>
              <label className="flex items-start gap-2 text-xs text-navy-700">
                <input type="checkbox" checked={consentComms} onChange={(e) => setConsentComms(e.target.checked)} className="mt-0.5" />
                I consent to receive claim-related communications (optional).
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full">Create account</Button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-navy-900/10 flex-1" />
              <span className="text-xs text-navy-700">or</span>
              <div className="h-px bg-navy-900/10 flex-1" />
            </div>
            <Button variant="outline" className="w-full" type="button" onClick={() => { loginDemo(); router.push("/dashboard"); }}>
              Continue with demo account
            </Button>

            <p className="text-sm text-navy-700 mt-6 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-600 font-medium hover:underline">Sign in</Link>
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
