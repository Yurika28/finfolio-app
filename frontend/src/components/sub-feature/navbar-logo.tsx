import Link from "next/link";

export default function NavbarLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="h-2 w-2 rounded-sm bg-hero-accent" aria-hidden="true" />
      <span className="font-display font-bold text-xl md:text-[23px] tracking-[-0.01em] text-hero-text-primary">
        FinFolio
      </span>
    </Link>
  );
}
