'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddHoldingDialog } from '@/components/portfolio/AddHoldingDialog'
import { portfolioService } from '@/services/portfolio.service'
import { formatCurrency } from '@/utils/formatCurrency'
import type { ICryptoRate, IAddHoldingPayload } from '@/types/api.types'

const CRYPTO_ICONS: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', DOGE: 'Ð', SOL: '◎', ADA: '₳', XRP: '✕',
}

export const CryptoCard = ({ rate }: { rate: ICryptoRate }) => {
  const [watching, setWatching] = useState(false)
  const [buyOpen,  setBuyOpen]  = useState(false)

  const handleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await portfolioService.addToWatchlist(rate.fromSymbol)
      setWatching(true)
    } catch {}
  }

  const handleBuy = async (payload: IAddHoldingPayload) => {
    await portfolioService.addHolding({ ...payload, symbol: rate.fromSymbol })
  }

  return (
    <>
      <Link href={`/crypto/${rate.fromSymbol}-${rate.toSymbol}`}>
        <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-lg">{CRYPTO_ICONS[rate.fromSymbol] || '🪙'}</span>
              {rate.fromSymbol}
            </CardTitle>
            <span className="text-xs text-zinc-500">{rate.fromSymbol} / {rate.toSymbol}</span>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold text-white">{formatCurrency(rate.exchangeRate)}</p>
            <p className="text-xs text-zinc-500 pb-1">Updated {new Date(rate.insertedAt).toLocaleDateString()}</p>

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
          symbol={rate.fromSymbol}
          open={buyOpen}
          onOpenChange={setBuyOpen}
          onAdd={handleBuy}
        />
      )}
    </>
  )
}