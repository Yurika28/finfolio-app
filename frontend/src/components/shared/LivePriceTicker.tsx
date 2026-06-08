'use client'
import { useEffect, useState } from 'react'
import { useContext } from 'react'
import { SocketContext } from '@/context/SocketContext'

interface TickerPrice {
  symbol: string
  price: number
  change: number
}

export function LivePriceTicker() {
  const socket = useContext(SocketContext)
  const [prices, setPrices] = useState<TickerPrice[]>([])

  useEffect(() => {
    if (!socket) return
    const handler = (data: TickerPrice[]) => setPrices(data)
    socket.on('prices:update', handler)
    return () => { socket.off('prices:update', handler) }
  }, [socket])

  if (!prices.length) return null

  const items = [...prices, ...prices]

  return (
    <div className="w-full overflow-hidden bg-zinc-950 border-b border-zinc-800 py-1.5">
      <div className="flex animate-ticker gap-8 whitespace-nowrap">
        {items.map((p, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-xs">
            <span className="text-zinc-400 font-mono">{p.symbol}</span>
            <span className="text-white font-medium">${p.price.toFixed(2)}</span>
            <span className={p.change >= 0 ? 'text-green-400' : 'text-red-400'}>
              {p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
