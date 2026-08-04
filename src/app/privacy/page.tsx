import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui";

const SECTIONS = [
  { title: "What we collect", body: "Account details you provide (name, email), incident and claim information you enter, documents you upload, and basic usage data needed to operate the service." },
  { title: "How we use your information", body: "To operate your account, generate your preliminary claim-readiness assessment, and — only with your explicit consent — share a claim summary with a lawyer you choose to contact." },
  { title: "Who can see your information", body: "By default, only you. Claim data is private and is never publicly visible. Information is shared with a lawyer only after you request a consultation and consent to share your summary." },
  { title: "Data storage and security", body: "In production, data is stored using industry-standard encryption in transit and at rest, with role-based access controls and audit logging. This demo stores data locally in your browser only." },
  { title: "Your rights", body: "You may access, update, or request deletion of your data at any time from your Profile page. Deletion requests are processed promptly." },
  { title: "Retention", body: "Data is retained as long as your account is active, or as needed to comply with legal obligations, after which it is deleted or anonymized." },
  { title: "Contact", body: "Questions about this policy can be directed to privacy@justicechamp.example (simulated for this demo)." },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container-page py-12 max-w-2xl">
        <h1 className="text-2xl font-bold text-navy-900">Privacy Policy</h1>
        <p className="text-sm text-navy-700 mt-2">Last updated: August 2026. This is demonstration content for the JusticeChamp MVP.</p>
        <div className="space-y-6 mt-8">
          {SECTIONS.map((s) => (
            <Card key={s.title}>
              <h2 className="font-semibold text-navy-900">{s.title}</h2>
              <p className="text-sm text-navy-700 mt-2">{s.body}</p>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
