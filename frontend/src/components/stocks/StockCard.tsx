'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PriceBadge } from '@/components/shared/PriceBadge'
import { AddHoldingDialog } from '@/components/portfolio/AddHoldingDialog'
import { changeColor } from '@/utils/formatChange'
import { formatDate } from '@/utils/formatDate'
import { portfolioService } from '@/services/portfolio.service'
import type { IStockQuote, IAddHoldingPayload } from '@/types/api.types'

export const StockCard = ({ stock }: { stock: IStockQuote }) => {
  const [watching, setWatching] = useState(false)
  const [buyOpen,  setBuyOpen]  = useState(false)

  const handleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await portfolioService.addToWatchlist(stock.symbol)
      setWatching(true)
    } catch {}
  }

  const handleBuy = async (payload: IAddHoldingPayload) => {
    await portfolioService.addHolding({ ...payload, symbol: stock.symbol })
  }

  return (
    <>
      <Link href={`/stocks/${stock.symbol}`}>
        <Card className="hover:border-zinc-600 transition-colors cursor-pointer bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-white">{stock.symbol}</CardTitle>
            <PriceBadge value={stock.dp} />
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold text-white">${stock.close.toFixed(2)}</p>
            <p className={`text-sm font-medium ${changeColor(stock.d)}`}>
              {stock.d >= 0 ? '+' : ''}{stock.d.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500">
              H ${stock.high.toFixed(2)} · L ${stock.low.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-600 pb-1">{formatDate(stock.insertedAt)}</p>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={handleWatchlist}
                title={watching ? 'In watchlist' : 'Add to watchlist'}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-md border transition-colors ${
                  watching
                    ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                    : 'border-yellow-600/50 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 hover:border-yellow-500'
                }`}
              >
                {watching ? '★ Watching' : '☆ Watchlist'}
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBuyOpen(true) }}
                className="flex-1 text-xs font-semibold py-1.5 rounded-md border border-green-600/50 text-green-400 bg-green-500/10 hover:bg-green-500/20 hover:border-green-500 transition-colors"
              >
                + Buy
              </button>
            </div>
          </CardContent>
        </Card>
      </Link>

      {buyOpen && (
        <AddHoldingDialog
          symbol={stock.symbol}
          open={buyOpen}
          onOpenChange={setBuyOpen}
          onAdd={handleBuy}
        />
      )}
    </>
  )
}