'use client'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import Navbar from '@/components/features/navigation-bar'
import { StockCard } from '@/components/stocks/StockCard'
import { CryptoCard } from '@/components/crypto/CryptoCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import { Badge } from '@/components/ui/badge'
import { useStocks } from '@/hooks/useStocks'
import { useCrypto } from '@/hooks/useCrypto'
import { useNews } from '@/hooks/useNews'
import { useIpo } from '@/hooks/useIpo'
import { useChat } from '@/hooks/useChat'
import { NewsSentiment } from '@/components/sub-feature/news-sentiment'
import { formatDate } from '@/utils/formatDate'
import Link from 'next/link'

export default function Home() {
  const { data: stocks, isLoading: sLoading } = useStocks()
  const { data: cryptos, isLoading: cLoading } = useCrypto()
  const { data: news, isLoading: nLoading } = useNews()
  const { data: ipos, isLoading: iLoading } = useIpo()
  const { messages, isLoading: chatLoading, send } = useChat()
  const [chatInput, setChatInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  const handleChatSend = () => {
    if (!chatInput.trim() || chatLoading) return
    send(chatInput.trim())
    setChatInput('')
  }

  const handleChatKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleChatSend()
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <section
          className="relative py-12 sm:py-16 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 container mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10">

            {/* Tagline */}
            <div className="flex-1 text-left">
              <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Your financial<br />
                <span className="text-green-400">command center.</span>
              </p>
              <p className="text-zinc-300 text-lg sm:text-xl mt-4 max-w-lg">
                Real-time stocks, crypto &amp; forex — plus AI analysis that actually explains what&apos;s moving and why.
              </p>
              <Link
                href="/stocks"
                className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-green-500 hover:bg-green-400 text-black font-semibold text-sm transition-colors"
              >
                Explore Markets →
              </Link>
            </div>

            {/* Mini Market Chat */}
            <div className="w-full lg:w-[420px] shrink-0">
              <Card className="bg-zinc-900/90 border-zinc-700 flex flex-col h-80">
                <div className="px-4 pt-3 pb-2 border-b border-zinc-800 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Market Chat</span>
                  <Link href="/chat" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                    Open full chat →
                  </Link>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
                  {messages.length === 0 && !chatLoading && (
                    <p className="text-zinc-500 text-xs text-center mt-6">Ask anything about markets, stocks, or crypto</p>
                  )}
                  <div className="space-y-3">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                          msg.role === 'user' ? 'bg-green-500 text-black font-medium' : 'bg-zinc-800 text-zinc-200'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-800 rounded-xl px-3 py-2 space-y-1.5">
                          <Skeleton className="h-2.5 w-32 bg-zinc-700" />
                          <Skeleton className="h-2.5 w-20 bg-zinc-700" />
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                </div>
                <div className="px-3 pb-3 pt-2 border-t border-zinc-800 flex gap-2">
                  <Textarea
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={handleChatKey}
                    placeholder="Ask about markets…"
                    rows={1}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none text-xs flex-1"
                  />
                  <Button
                    onClick={handleChatSend}
                    disabled={!chatInput.trim() || chatLoading}
                    className="bg-green-500 hover:bg-green-400 text-black font-semibold text-xs px-3 shrink-0"
                  >
                    Send
                  </Button>
                </div>
              </Card>
            </div>

          </div>
        </section>
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
