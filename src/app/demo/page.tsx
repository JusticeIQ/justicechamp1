"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, Button, Badge } from "@/components/ui";
import { useAppState } from "@/lib/store";

const JOURNEY = [
  { step: 1, title: "Open the landing page", detail: "Introduces JusticeChamp and the JusticeIQ ecosystem.", href: "/" },
  { step: 2, title: "Sign in or use demo access", detail: "One click loads a seeded demo consumer account.", href: "/login" },
  { step: 3, title: "View the dashboard", detail: "See active claims, tasks, documents, and reminders at a glance.", href: "/dashboard" },
  { step: 4, title: "Start a new incident report", detail: "Begin the guided intake workflow.", href: "/report-incident" },
  { step: 5, title: "Choose Personal Injury or Employment", detail: "Each path has a tailored multi-step questionnaire.", href: "/report-incident" },
  { step: 6, title: "Complete intake steps", detail: "Plain-language questions with autosave and progress tracking.", href: "/report-incident/personal-injury" },
  { step: 7, title: "Upload or select sample evidence", detail: "Organize documents by category and importance.", href: "/documents" },
  { step: 8, title: "Build a timeline", detail: "Add chronological events and attach evidence.", href: "/timeline" },
  { step: 9, title: "Submit the incident report", detail: "Review responses before submitting for assessment.", href: "/claims" },
  { step: 10, title: "Generate a claim-readiness score", detail: "See a transparent, factor-based preliminary score.", href: "/rate-my-claim" },
  { step: 11, title: "Review missing information", detail: "Rate My Claim highlights specific gaps to close.", href: "/rate-my-claim" },
  { step: 12, title: "Improve the claim profile", detail: "Use “Improve My Score” to jump back into weak areas.", href: "/rate-my-claim" },
  { step: 13, title: "View lawyer matches", detail: "See sample partner lawyers matched to the claim.", href: "/lawyer-matches" },
  { step: 14, title: "Request a consultation", detail: "Consent-based sharing of the claim summary.", href: "/lawyer-matches" },
  { step: 15, title: "Return to the dashboard", detail: "See updated status, tasks, and notifications.", href: "/dashboard" },
];

export default function DemoPage() {
  const router = useRouter();
  const { loginDemo } = useAppState();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-navy-950 text-white">
          <div className="container-page py-14">
            <Badge tone="teal">Demo Tour</Badge>
            <h1 className="text-3xl font-bold mt-3">A guided, 15-step walkthrough of JusticeChamp</h1>
            <p className="text-white/70 mt-2 max-w-2xl text-sm">
              Built for investor, lawyer, and partner demonstrations. Use this as a presenter script, or launch the demo
              account and follow along in the live product.
            </p>
            <Button
              variant="cta"
              className="mt-6"
              onClick={() => {
                loginDemo();
                router.push("/dashboard");
              }}
            >
              Launch demo account
            </Button>
          </div>
        </section>

        <section className="container-page py-12">
          <ol className="space-y-4">
            {JOURNEY.map((item) => (
              <li key={item.step}>
                <Card className="flex items-start gap-4">
                  <span className="h-8 w-8 shrink-0 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-semibold">{item.step}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-navy-900 text-sm">{item.title}</p>
                    <p className="text-sm text-navy-700 mt-0.5">{item.detail}</p>
                  </div>
                  <a href={item.href} className="text-xs text-teal-600 font-medium hover:underline whitespace-nowrap mt-1">
                    Jump to step →
                  </a>
                </Card>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </div>
  );
}
