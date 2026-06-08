"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import NavbarLogo from "@/components/sub-feature/navbar-logo"
import NavbarLinks from "@/components/sub-feature/navbar-links";
import NavbarSearch from "@/components/sub-feature/navbar-search";
import NavbarAuth from "@/components/sub-feature/navbar-auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-black text-accent border-b border-zinc-800">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left */}
        <div className="flex items-center gap-6">
          <NavbarLogo />

          {/* Desktop links */}
          <div className="hidden md:block">
            <NavbarLinks />
          </div>
        </div>

        {/* Right (desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <NavbarSearch />
          <NavbarAuth />
        </div>

        {/* Burger (mobile) */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded hover:bg-zinc-800 transition"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-800 bg-black">
          <div className="flex flex-col gap-6 px-6 py-6">
            <NavbarLinks />
            <NavbarSearch />
            <NavbarAuth />
          </div>
        </div>
      )}
    </nav>
  );
}
