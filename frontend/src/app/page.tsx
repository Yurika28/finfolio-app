'use client'
import Navbar from '@/components/features/navigation-bar'
import HeroSection from '@/components/features/hero-section'
import { StockCard } from '@/components/stocks/StockCard'
import { CryptoCard } from '@/components/crypto/CryptoCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useStocks } from '@/hooks/useStocks'
import { useCrypto } from '@/hooks/useCrypto'
import { useNews } from '@/hooks/useNews'
import { useIpo } from '@/hooks/useIpo'
import { NewsSentiment } from '@/components/sub-feature/news-sentiment'
import { formatDate } from '@/utils/formatDate'
import Link from 'next/link'

export default function Home() {
  const { data: stocks, isLoading: sLoading } = useStocks()
  const { data: cryptos, isLoading: cLoading } = useCrypto()
  const { data: news, isLoading: nLoading } = useNews()
  const { data: ipos, isLoading: iLoading } = useIpo()

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <HeroSection />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Stocks</h2>
            <Link href="/stocks" className="text-sm text-zinc-400 hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          {sLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stocks?.slice(0, 4).map(s => <StockCard key={s.symbol} stock={s} />)}
            </div>
          )}
        </section>

        
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Crypto</h2>
            <Link href="/crypto" className="text-sm text-zinc-400 hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          {cLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cryptos?.slice(0, 3).map(r => <CryptoCard key={r.fromSymbol} rate={r} />)}
            </div>
          )}
        </section>

        {/* News Sentiment */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">News Sentiment</h2>
            <Link href="/news" className="text-sm text-zinc-400 hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          <NewsSentiment limit={3} />
        </section>

        {/* News + IPO side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Market News */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Latest News</h2>
              <Link href="/news" className="text-sm text-zinc-400 hover:text-white transition-colors">
                View all →
              </Link>
            </div>
            {nLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {news?.slice(0, 4).map((item, i) => (
                  <a
                    key={i}
                    href={item.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-colors"
                  >
                    <p className="text-sm text-white font-medium line-clamp-2">{item.headline}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {item.source} · {item.datetime ? formatDate(new Date(item.datetime * 1000).toISOString()) : ''}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* IPO Calendar */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Upcoming IPOs</h2>
              <Link href="/ipo" className="text-sm text-zinc-400 hover:text-white transition-colors">
                View all →
              </Link>
            </div>
            {iLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
            ) : ipos && ipos.length > 0 ? (
              <div className="space-y-2">
                {ipos.slice(0, 5).map(ipo => (
                  <div
                    key={ipo.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{ipo.name || '—'}</p>
                      <p className="text-xs text-zinc-500 font-mono">{ipo.symbol} · {ipo.date}</p>
                    </div>
                    <Badge variant="outline" className="text-xs text-zinc-400 capitalize shrink-0">
                      {ipo.status || 'unknown'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No upcoming IPOs.</p>
            )}
          </section>

        </div>

      </main>
    </div>
  )
}
