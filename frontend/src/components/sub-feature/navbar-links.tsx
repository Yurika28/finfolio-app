import Link from "next/link";

export default function NavbarLinks() {
  return (
    <div className="flex items-center gap-8 text-md">
      <Link href="/stocks">Stocks</Link>
      <Link href="/crypto">Crypto</Link>
      <Link href="/forex">Forex</Link>
      <Link href="/news">News</Link>
      <Link href="/about">About</Link>
    </div>
  );
}
