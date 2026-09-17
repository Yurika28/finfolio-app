"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/stocks", label: "Stocks" },
  { href: "/crypto", label: "Crypto" },
  { href: "/forex", label: "Forex" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
];

export default function NavbarLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-9 font-body text-[15px] font-medium">
      {LINKS.map(link => {
        const active = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "text-hero-text-primary" : "text-hero-text-muted hover:text-hero-text-primary transition-colors"}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
