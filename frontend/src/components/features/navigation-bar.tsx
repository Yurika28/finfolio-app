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
    <nav className="bg-hero-bg border-b border-hero-border">
      {/* Top bar */}
      <div className="flex items-center justify-between h-[72px] md:h-[100px] px-5 md:px-16">
        {/* Left */}
        <div className="flex items-center gap-11">
          <NavbarLogo />

          {/* Desktop links */}
          <div className="hidden md:block">
            <NavbarLinks />
          </div>
        </div>

        {/* Right (desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <NavbarSearch />
          <NavbarAuth />
        </div>

        {/* Burger (mobile) */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex items-center justify-center h-11 w-11 -mr-2 rounded hover:bg-hero-surface transition text-hero-text-primary"
          aria-label="Open menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-hero-border bg-hero-bg">
          <div className="flex flex-col gap-6 px-5 py-6">
            <NavbarLinks />
            <NavbarSearch />
            <NavbarAuth />
          </div>
        </div>
      )}
    </nav>
  );
}
