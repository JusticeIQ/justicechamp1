"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/lib/store";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/claims", label: "Claims", icon: "📁" },
  { href: "/important-dates", label: "Dates", icon: "📅" },
  { href: "/notices", label: "Notices", icon: "🔔" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated, unreadNoticeCount } = useAppState();
  if (!isAuthenticated) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-navy-900/10 lg:hidden">
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-2 text-[11px] gap-0.5 focus-ring ${active ? "text-teal-600 font-semibold" : "text-navy-700"}`}
            >
              <span aria-hidden className="relative">
                {item.icon}
                {item.href === "/notices" && unreadNoticeCount > 0 && (
                  <span className="absolute -top-0.5 -right-1.5 h-2 w-2 rounded-full bg-teal-500" />
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
