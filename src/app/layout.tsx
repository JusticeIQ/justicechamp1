import type { Metadata } from "next";
import "./globals.css";
import { AppStateProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "JusticeChamp™ — Your Personal Legal Resource",
  description:
    "A free, private place to get legal information, organize important records, and connect with the right legal help when you need it — so you're never overwhelmed when legal issues arise. Part of the JusticeIQ legal intelligence ecosystem.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
