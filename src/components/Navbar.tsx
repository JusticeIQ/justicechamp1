"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { Button } from "./ui";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/report-incident", label: "Report an Incident" },
  { href: "/claims", label: "My Claims" },
  { href: "/documents", label: "Documents" },
  { href: "/resources", label: "Resources" },
  { href: "/faq", label: "FAQ" },
  { href: "/help", label: "Help" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAppState();

  return (
    <header className="sticky top-0 z-40 bg-navy-950/95 backdrop-blur border-b border-white/10">
      <div className="container-page flex items-center justify-between h-16">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 focus-ring rounded">
          <span className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-sm">JC</span>
          <span className="text-white font-semibold text-lg tracking-tight">
            JusticeChamp<span className="text-teal-400">™</span>
          </span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium focus-ring transition-colors ${
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    ? "text-white bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/rate-my-claim" className="hidden md:inline-flex">
                <Button variant="cta" size="sm">
                  Rate My Claim
                </Button>
              </Link>
              <Link href="/profile" className="hidden sm:inline-flex h-9 w-9 rounded-full bg-white/10 text-white items-center justify-center text-xs font-semibold focus-ring">
                {user?.fullName?.slice(0, 1) ?? "U"}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 hidden sm:inline-flex"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" size="sm">
                  Create account
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
