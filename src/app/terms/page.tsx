import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui";

const SECTIONS = [
  { title: "Not a law firm", body: "JusticeChamp is a technology platform, not a law firm, and does not provide legal representation. Use of JusticeChamp does not create an attorney-client relationship with JusticeChamp or JusticeIQ." },
  { title: "Informational purpose only", body: "Content, including the Rate My Claim assessment, is preliminary and informational. It is not legal advice and does not guarantee any legal outcome, settlement value, or that any lawyer will accept your matter." },
  { title: "Your responsibilities", body: "You are responsible for the accuracy of information you provide and for preserving evidence honestly. Do not alter, destroy, hide, or fabricate evidence." },
  { title: "Lawyer matching", body: "Lawyer profiles are provided for informational purposes. Any engagement with a lawyer is a separate agreement between you and that lawyer or firm." },
  { title: "Limitation of liability", body: "JusticeChamp and JusticeIQ are provided on an \"as is\" basis and disclaim liability to the fullest extent permitted by law for decisions made based on information provided through the platform." },
  { title: "Changes to these terms", body: "We may update these terms from time to time. Continued use of the platform constitutes acceptance of the updated terms." },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container-page py-12 max-w-2xl">
        <h1 className="text-2xl font-bold text-navy-900">Terms of Service</h1>
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
