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
            <Avatar className="h-8 w-8 border border-zinc-700 group-hover:border-zinc-500 transition-colors">
              <AvatarFallback className="bg-zinc-800 text-white text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-zinc-400 hidden sm:inline group-hover:text-white transition-colors">
              {user.name || user.email}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white min-w-40">
          <DropdownMenuItem asChild className="hover:bg-zinc-800 cursor-pointer">
            <Link href="/portfolio">Portfolio</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-zinc-800 cursor-pointer">
            <Link href="/insights">AI Insights</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-zinc-800 cursor-pointer">
            <Link href="/chat">Market Chat</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={logout}
            className="text-red-400 hover:bg-zinc-800 hover:text-red-300 cursor-pointer"
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/register">
        <button className="px-4 py-2 rounded bg-green-500 text-black hover:bg-green-600 text-sm font-medium transition">
          Create Account
        </button>
      </Link>
      <Link href="/login">
        <button className="px-4 py-2 rounded border border-green-500 text-green-500 hover:bg-green-500/10 text-sm font-medium transition">
          Log In
        </button>
      </Link>
    </div>
  )
}
