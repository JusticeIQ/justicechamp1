"use client";

import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-navy-700 mb-4">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-navy-900/30">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-teal-600 focus-ring rounded">
                {item.label}
              </Link>
            ) : (
              <span className="text-navy-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function BackButton({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <a href={href} className="inline-flex items-center gap-1 text-sm text-navy-700 hover:text-teal-600 focus-ring rounded mb-4">
      <span aria-hidden>←</span> {label}
    </a>
  );
}
