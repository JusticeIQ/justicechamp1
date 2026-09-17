"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { Footer } from "./Footer";
import { Spinner } from "./ui";

export function AppShell({ children, requireAuth = true }: { children: React.ReactNode; requireAuth?: boolean }) {
  const { isAuthenticated, hydrated } = useAppState();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && requireAuth && !isAuthenticated) {
      // Preserve where the person was (including any in-progress step,
      // since a claim id in the URL path is kept) so a session expiry
      // never silently drops them — after signing back in, they return here.
      const target = typeof window !== "undefined" ? window.location.pathname + window.location.search : pathname;
      router.replace(`/login?redirect=${encodeURIComponent(target || pathname)}`);
    }
  }, [hydrated, requireAuth, isAuthenticated, router, pathname]);

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
