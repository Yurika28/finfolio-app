'use client'
import { KeyboardEvent, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearch } from '@/context/SearchContext'

type SearchItem = { symbol: string; name: string; type: 'stock' | 'crypto' }

const SEARCH_INDEX: SearchItem[] = [
  { symbol: 'AAPL',  name: 'Apple Inc.',             type: 'stock'  },
  { symbol: 'NVDA',  name: 'NVIDIA Corp.',            type: 'stock'  },
  { symbol: 'TSLA',  name: 'Tesla Inc.',              type: 'stock'  },
  { symbol: 'MSFT',  name: 'Microsoft Corp.',         type: 'stock'  },
  { symbol: 'AMZN',  name: 'Amazon.com Inc.',         type: 'stock'  },
  { symbol: 'GOOGL', name: 'Alphabet Inc.',           type: 'stock'  },
  { symbol: 'META',  name: 'Meta Platforms Inc.',     type: 'stock'  },
  { symbol: 'NFLX',  name: 'Netflix Inc.',            type: 'stock'  },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway',      type: 'stock'  },
  { symbol: 'JPM',   name: 'JPMorgan Chase',          type: 'stock'  },
  { symbol: 'BTC',   name: 'Bitcoin',                 type: 'crypto' },
  { symbol: 'ETH',   name: 'Ethereum',                type: 'crypto' },
  { symbol: 'DOGE',  name: 'Dogecoin',                type: 'crypto' },
  { symbol: 'SOL',   name: 'Solana',                  type: 'crypto' },
  { symbol: 'ADA',   name: 'Cardano',                 type: 'crypto' },
  { symbol: 'XRP',   name: 'XRP',                     type: 'crypto' },
  { symbol: 'BNB',   name: 'BNB',                     type: 'crypto' },
  { symbol: 'AVAX',  name: 'Avalanche',               type: 'crypto' },
  { symbol: 'MATIC', name: 'Polygon',                 type: 'crypto' },
  { symbol: 'LTC',   name: 'Litecoin',                type: 'crypto' },
]

function toPath(item: SearchItem) {
  return item.type === 'crypto'
    ? `/crypto/${item.symbol}-USD`
    : `/stocks/${item.symbol}`
}

export default function NavbarSearch() {
  const router = useRouter()
  const { query, setQuery } = useSearch()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const trimmed = query.trim().toUpperCase()
  const results = trimmed.length === 0 ? [] : SEARCH_INDEX.filter(
    item => item.symbol.startsWith(trimmed) || item.name.toUpperCase().includes(trimmed)
  ).slice(0, 6)

  const navigate = (item: SearchItem) => {
    setQuery('')
    setOpen(false)
    router.push(toPath(item))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key !== 'Enter' || !trimmed) return
    const exact = SEARCH_INDEX.find(i => i.symbol === trimmed)
    if (exact) { navigate(exact); return }
    // unknown symbol — route as stock by default
    setQuery('')
    setOpen(false)
    router.push(`/stocks/${trimmed}`)
  }

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="navbar-search-input" className="sr-only">
        Search tickers
      </label>
      <input
        id="navbar-search-input"
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        placeholder="Search tickers…"
        className="px-3.5 py-2 pr-9 rounded-full bg-hero-surface text-[13px] font-body text-hero-text-primary placeholder-hero-text-faint border border-hero-border focus:outline-none focus:ring-1 focus:ring-hero-accent w-[210px]"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-hero-text-muted pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
      </svg>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-hero-bg border border-hero-border rounded-xl shadow-xl z-50 overflow-hidden">
          {results.map(item => (
            <button
              key={item.symbol}
              onMouseDown={() => navigate(item)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-hero-surface transition-colors text-left"
            >
              <div>
                <span className="text-sm font-semibold text-hero-text-primary">{item.symbol}</span>
                <span className="text-xs text-hero-text-muted ml-2">{item.name}</span>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                item.type === 'crypto' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {item.type === 'crypto' ? 'CRYPTO' : 'STOCK'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}