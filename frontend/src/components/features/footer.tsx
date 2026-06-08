// src/components/footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-accent">FinPulse</span>
          <span className="text-sm text-zinc-500">© {new Date().getFullYear()}</span>
        </div>

        {/* Navigation */}
        <nav className="flex gap-6 text-sm">
          <Link href="/about" className="hover:text-accent transition">
            About
          </Link>
          <Link href="/contact" className="hover:text-accent transition">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-accent transition">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-accent transition">
            Terms
          </Link>
        </nav>

        {/* Socials */}
        <div className="flex gap-4">
          <a
            href="https://twitter.com/finpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition"
          >
            Twitter
          </a>
          <a
            href="https://linkedin.com/company/finpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/finpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
