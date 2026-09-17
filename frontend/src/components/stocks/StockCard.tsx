'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PriceBadge } from '@/components/shared/PriceBadge'
import { TradeDialog } from '@/components/portfolio/TradeDialog'
import { changeColor } from '@/utils/formatChange'
import { formatDate } from '@/utils/formatDate'
import { portfolioService } from '@/services/portfolio.service'
import { useTrading } from '@/hooks/usePortfolio'
import type { IStockQuote } from '@/types/api.types'
import { toast } from 'sonner'

const fmt = (n: number | null | undefined) => (typeof n === 'number' ? n.toFixed(2) : '—')

export const StockCard = ({ stock }: { stock: IStockQuote }) => {
  const [watching, setWatching] = useState(false)
  const [buyOpen,  setBuyOpen]  = useState(false)
  const { buy } = useTrading()

  const handleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await portfolioService.addToWatchlist(stock.symbol)
      setWatching(true)
    } catch (err) {
      const maybeAxiosError = err as { response?: { data?: { error?: string } } }
      const message = maybeAxiosError.response?.data?.error ?? 'Failed to add to watchlist'
      toast.error(message, { position: 'top-center' })
    }
  }

  const handleBuy = (quantity: number) => buy({ assetType: 'STOCK', symbol: stock.symbol, quantity })

  return (
    <>
      <Link href={`/stocks/${stock.symbol}`}>
        <Card className="hover:border-zinc-600 transition-colors cursor-pointer bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-white">{stock.symbol}</CardTitle>
            <PriceBadge value={stock.dp} />
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold text-white">${fmt(stock.close)}</p>
            <p className={`text-sm font-medium ${changeColor(stock.d)}`}>
              {stock.d >= 0 ? '+' : ''}{fmt(stock.d)}
            </p>
            <p className="text-xs text-zinc-500">
              H ${fmt(stock.high)} · L ${fmt(stock.low)}
            </p>
            <p className="text-xs text-zinc-600 pb-1">{formatDate(stock.insertedAt)}</p>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={handleWatchlist}
                title={watching ? 'In watchlist' : 'Add to watchlist'}
                aria-label={watching ? `${stock.symbol} is in your watchlist` : `Add ${stock.symbol} to watchlist`}
                aria-pressed={watching}
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

      <TradeDialog
        symbol={stock.symbol}
        assetType="STOCK"
        side="BUY"
        open={buyOpen}
        onOpenChange={setBuyOpen}
        onSubmit={handleBuy}
      />
    </>
  )
}