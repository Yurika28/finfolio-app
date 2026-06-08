import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { SocketProvider } from '@/context/SocketContext'
import { SearchProvider } from '@/context/SearchContext'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinFolio — AI Finance Tracker',
  description: 'Track stocks, crypto, forex with AI insights',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <SocketProvider>
            <SearchProvider>
              {children}
              <Toaster />
            </SearchProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
