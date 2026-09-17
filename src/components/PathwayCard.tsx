"use client";

import Link from "next/link";
import { Card } from "./ui";

export function PathwayCard({
  href,
  icon,
  title,
  description,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="block focus-ring rounded-xl2 h-full">
      <Card className="h-full hover:border-teal-400 hover:shadow-lg transition-all border-2 border-transparent cursor-pointer text-left">
        <div className="h-12 w-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-4" aria-hidden>
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
        <p className="text-sm text-navy-700 mt-2">{description}</p>
      </Card>
    </Link>
  );
}
