"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { Footer } from "./Footer";
import { Spinner } from "./ui";

export function AppShell({ children, requireAuth = true }: { children: React.ReactNode; requireAuth?: boolean }) {
  const { isAuthenticated, hydrated } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && requireAuth && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, requireAuth, isAuthenticated, router]);

  if (requireAuth && !hydrated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner label="Loading your workspace" />
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
