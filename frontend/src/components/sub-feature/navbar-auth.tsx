'use client'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function NavbarAuth() {
  const { user, logout } = useAuth()

  if (user) {
    const initials = user.name
      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : user.email.slice(0, 2).toUpperCase()

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 focus:outline-none group">
            <Avatar className="h-8 w-8 border border-hero-border group-hover:border-hero-accent transition-colors">
              <AvatarFallback className="bg-hero-surface text-hero-text-primary text-xs font-medium font-body">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="font-body text-sm text-hero-text-muted hidden sm:inline group-hover:text-hero-text-primary transition-colors">
              {user.name || user.email}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-hero-bg border-hero-border text-hero-text-primary font-body min-w-40">
          <DropdownMenuItem asChild className="hover:bg-hero-surface cursor-pointer">
            <Link href="/portfolio">Portfolio</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-hero-surface cursor-pointer">
            <Link href="/insights">AI Insights</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-hero-surface cursor-pointer">
            <Link href="/chat">Market Chat</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-hero-border" />
          <DropdownMenuItem
            onClick={logout}
            className="text-red-400 hover:bg-hero-surface hover:text-red-300 cursor-pointer"
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-5">
      <Link
        href="/login"
        className="font-body text-[15px] font-medium text-hero-text-primary hover:text-hero-accent transition-colors"
      >
        Log In
      </Link>
      <Link
        href="/register"
        className="rounded-md bg-hero-accent px-[22px] py-3 font-body text-sm font-semibold text-hero-accent-on hover:bg-hero-accent-hover transition-colors"
      >
        Create Account
      </Link>
    </div>
  )
}
