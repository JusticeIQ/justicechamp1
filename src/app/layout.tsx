import type { Metadata } from "next";
import "./globals.css";
import { AppStateProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "JusticeChamp™ — Document what happened. Understand your options.",
  description:
    "JusticeChamp helps you document incidents, organize evidence, understand claim readiness, and connect with lawyers. Part of the JusticeIQ legal intelligence ecosystem.",
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
