import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white/70 mt-16">
      <div className="container-page py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <p className="text-white font-semibold">JusticeChamp™</p>
          <p className="mt-2 text-white/50 text-xs">Part of the JusticeIQ™ legal intelligence ecosystem.</p>
        </div>
        <div>
          <p className="text-white/90 font-medium mb-2">Product</p>
          <ul className="space-y-1.5">
            <li><Link href="/report-incident" className="hover:text-white">Report an Incident</Link></li>
            <li><Link href="/rate-my-claim" className="hover:text-white">Rate My Claim</Link></li>
            <li><Link href="/lawyer-matches" className="hover:text-white">Lawyer Matching</Link></li>
            <li><Link href="/demo" className="hover:text-white">Demo Tour</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white/90 font-medium mb-2">Support</p>
          <ul className="space-y-1.5">
            <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/help" className="hover:text-white">Help</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white/90 font-medium mb-2">Legal</p>
          <ul className="space-y-1.5">
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-xs text-white/40 text-center px-4">
        JusticeChamp is not a law firm and does not provide legal advice or representation. © 2026 JusticeIQ Technologies, Inc. Demonstration product — all sample data is fictional.
      </div>
    </footer>
  );
}
