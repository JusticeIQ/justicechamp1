import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, Badge } from "@/components/ui";

const PRINCIPLES = [
  { title: "Plain-language guidance", desc: "Every question is written in everyday language, not legal jargon." },
  { title: "Evidence preservation", desc: "Organize photos, records, and correspondence in one secure place." },
  { title: "Transparent scoring", desc: "See exactly what drives your claim-readiness score, with no hidden math." },
  { title: "Human lawyer review", desc: "Your information can be shared, with consent, with a licensed lawyer." },
  { title: "Privacy-forward", desc: "Your claim data is private by default and never publicly visible." },
  { title: "Accessible by design", desc: "Built mobile-first with clear contrast and readable typography." },
];

const STEPS = [
  { n: "1", title: "Document what happened", desc: "Answer guided, plain-language questions about your incident." },
  { n: "2", title: "Understand your options", desc: "Get a transparent, preliminary claim-readiness assessment." },
  { n: "3", title: "Take the next step", desc: "Connect with a licensed lawyer matched to your situation." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-navy-950 text-white">
          <div className="container-page py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Badge tone="teal">Powered by SolonIQ™</Badge>
              </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                      Life is unpredictable.<br />Being prepared doesn't have to be.
          </h1>
                      <p className="mt-4 text-lg text-white/80 max-w-lg">
                                  A free, private place to get legal information, organize important records, and connect with the right legal
                                  help when you need it — so you're never overwhelmed when legal issues arise.
                      </p>
                      <p className="mt-4 text-white/60 max-w-lg text-sm">
                                  Know what to do before you need to know. JusticeChamp helps you organize evidence, see a transparent
                                  claim-readiness score, and connect with vetted lawyers when you're ready.
                      </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="inline-flex items-center justify-center rounded-lg font-medium px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-500/30">
                  Create a free account
                </Link>
                <Link href="/demo" className="inline-flex items-center justify-center rounded-lg font-medium px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  Explore the demo tour
                </Link>
              </div>
              <p className="mt-4 text-xs text-white/40 max-w-md">
                JusticeChamp is not a law firm and does not provide legal advice. It provides preliminary, informational
                analysis to help you prepare — not a legal opinion or guaranteed outcome.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white rounded-xl2 shadow-2xl p-6 text-navy-900">
                <p className="text-xs font-medium text-navy-700 mb-3">Rate My Claim — preview</p>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-full border-8 border-teal-500 flex items-center justify-center text-2xl font-bold">78</div>
                  <div>
                    <p className="font-semibold">Strong intake readiness</p>
                    <p className="text-xs text-navy-700 mt-1">Evidence, timeline, and documentation are well organized.</p>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs"><span>Evidence strength</span><span>72%</span></div>
                  <div className="h-1.5 bg-navy-900/10 rounded-full"><div className="h-full bg-teal-500 rounded-full" style={{ width: "72%" }} /></div>
                  <div className="flex justify-between text-xs mt-2"><span>Timeline clarity</span><span>85%</span></div>
                  <div className="h-1.5 bg-navy-900/10 rounded-full"><div className="h-full bg-teal-500 rounded-full" style={{ width: "85%" }} /></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-page py-16">
                  <p className="text-teal-600 text-sm font-semibold uppercase tracking-wide text-center mb-2">Know what to do before you need to know</p>
        <h2 className="text-2xl font-bold text-navy-900 text-center">A guided path from incident to informed next step</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {STEPS.map((s) => (
              <Card key={s.n}>
                <span className="h-9 w-9 rounded-full bg-navy-900 text-white flex items-center justify-center font-semibold text-sm">{s.n}</span>
                <h3 className="mt-4 font-semibold text-navy-900">{s.title}</h3>
                <p className="mt-1 text-sm text-navy-700">{s.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-white border-y border-navy-900/5">
          <div className="container-page py-16">
            <div className="grid md:grid-cols-2 gap-3 mb-8">
              <h2 className="text-2xl font-bold text-navy-900">Built for two of the most common — and most consequential — legal situations</h2>
              <p className="text-navy-700 text-sm self-center">
                JusticeChamp's initial release focuses on personal injury and employment law, with jurisdiction- and
                category-specific guidance for each.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-teal-200">
                <Badge>Personal Injury</Badge>
                <h3 className="mt-3 font-semibold text-lg text-navy-900">Motor vehicle, slip and fall, premises, medical, and product injury matters</h3>
                <p className="mt-2 text-sm text-navy-700">Document injuries, medical treatment, insurance details, and evidence with a guided 16-step intake.</p>
              </Card>
              <Card className="border-teal-200">
                <Badge>Employment Law</Badge>
                <h3 className="mt-3 font-semibold text-lg text-navy-900">Termination, discrimination, harassment, retaliation, and wage disputes</h3>
                <p className="mt-2 text-sm text-navy-700">Capture chronology, employer responses, and documentation with a guided 18-step intake.</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="container-page py-16">
          <h2 className="text-2xl font-bold text-navy-900 text-center">Principles behind the product</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mt-10">
            {PRINCIPLES.map((p) => (
              <Card key={p.title}>
                <h3 className="font-semibold text-navy-900 text-sm">{p.title}</h3>
                <p className="mt-1 text-sm text-navy-700">{p.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="container-page pb-20">
          <Card className="bg-navy-900 text-white text-center py-12">
                    <p className="text-teal-400 text-xs font-semibold uppercase tracking-wide mb-2">When life changes unexpectedly, JusticeChamp helps you stay organized and connected</p>
          <h2 className="text-2xl font-bold">See it end-to-end in under 5 minutes</h2>
            <p className="mt-2 text-white/70 max-w-xl mx-auto text-sm">
              Use the one-click demo account to explore a preloaded personal injury claim and employment claim, complete with
              sample documents, timelines, claim scores, and lawyer matches.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link href="/login" className="inline-flex items-center justify-center rounded-lg font-medium px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white">
                Continue with demo account
              </Link>
              <Link href="/demo" className="inline-flex items-center justify-center rounded-lg font-medium px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                View guided demo tour
              </Link>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
