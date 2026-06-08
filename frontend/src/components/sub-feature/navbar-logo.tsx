import Link from "next/link";

export default function NavbarLogo() {
  return (
    <Link href="/">
      <div className="font-bold text-3xl md:text-4xl tracking-wider">
        Finpulse
      </div>
    </Link>
  );
}
