import type { Metadata } from 'next'
import { Geist, Geist_Mono, Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { SocketProvider } from '@/context/SocketContext'
import { SearchProvider } from '@/context/SearchContext'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const bricolageGrotesque = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
})
const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})
const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['500'],
})

export const metadata: Metadata = {
  title: 'FinFolio — AI Finance Tracker',
  description: 'Track stocks, crypto, forex with AI insights',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased`}>
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
