'use client'
import { useState } from 'react'
import Navbar from '@/components/features/navigation-bar'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TradeDialog } from '@/components/portfolio/TradeDialog'
import { useWatchlist, useHoldings, useBalance, useTrading } from '@/hooks/usePortfolio'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import type { IHolding } from '@/types/api.types'
import Link from 'next/link'
import { toast } from 'sonner'

export default function PortfolioPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [tab, setTab] = useState<'watchlist' | 'holdings'>('watchlist')
  const [symbol, setSymbol] = useState('')
  const [sellTarget, setSellTarget] = useState<IHolding | null>(null)

  const watchlist = useWatchlist()
  const holdings  = useHoldings()
  const balance   = useBalance()
  const { sell }  = useTrading()

  const handleSell = async (quantity: number) => {
    if (!sellTarget) return
    await sell({ assetType: sellTarget.assetType, symbol: sellTarget.symbol, quantity })
    holdings.reload()
    balance.reload()
  }

  if (!authLoading && !user) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <p className="text-zinc-400 mb-4">Sign in to manage your portfolio</p>
          <Link href="/login">
            <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold">
              Sign In
            </Button>
          </Link>
        </main>
      </div>
    )
  }

  const handleAddWatch = async () => {
    if (!symbol.trim()) return
    try {
      await watchlist.add(symbol.trim().toUpperCase())
      setSymbol('')
    } catch (err) {
      const maybeAxiosError = err as { response?: { data?: { error?: string } } }
      const message = maybeAxiosError.response?.data?.error ?? 'Failed to add to watchlist'
      toast.error(message, { position: 'top-center' })
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Portfolio</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Simulated trading — cash balance:{' '}
              {balance.error ? (
                <span className="text-red-400">{balance.error}</span>
              ) : (
                <span className="text-green-400 font-semibold">
                  {balance.isLoading ? '…' : formatCurrency(balance.cashBalance ?? 0)}
                </span>
              )}
            </p>
          </div>
          <Tabs value={tab} onValueChange={v => setTab(v as 'watchlist' | 'holdings')}>
            <TabsList className="bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Watchlist tab */}
        {tab === 'watchlist' && (
          <div className="space-y-4">
            <div className="flex gap-2 max-w-sm">
              <Input
                value={symbol}
                onChange={e => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL"
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                onKeyDown={e => e.key === 'Enter' && handleAddWatch()}
              />
              <Button
                onClick={handleAddWatch}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold shrink-0"
              >
                Watch
              </Button>
            </div>

            {watchlist.error && <ErrorMessage message={watchlist.error} />}

            {watchlist.isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
              </div>
            )}

            {!watchlist.isLoading && !watchlist.data?.length && (
              <EmptyState title="No symbols watched" description="Add a ticker above to start tracking" />
            )}

            {watchlist.data && watchlist.data.length > 0 && (
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Symbol</TableHead>
                      <TableHead className="text-zinc-400 hidden sm:table-cell">Added</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {watchlist.data.map(item => (
                      <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-900">
                        <TableCell>
                          <Link
                            href={`/stocks/${item.symbol}`}
                            className="text-white font-mono font-medium hover:text-green-400 transition-colors"
                          >
                            {item.symbol}
                          </Link>
                        </TableCell>
                        <TableCell className="text-zinc-500 text-sm hidden sm:table-cell">
                          {formatDate(item.addedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => watchlist.remove(item.symbol)}
                            className="text-zinc-500 hover:text-red-400 hover:bg-transparent text-xs"
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* Holdings tab */}
        {tab === 'holdings' && (
          <div className="space-y-4">
            {holdings.error && <ErrorMessage message={holdings.error} />}

            {holdings.isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
            )}

            {!holdings.isLoading && !holdings.data?.length && (
              <EmptyState title="No holdings yet" description="Use the + Buy button on any stock or crypto card to open a position" />
            )}

            {holdings.data && holdings.data.length > 0 && (
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Symbol</TableHead>
                      <TableHead className="text-zinc-400 text-right">Qty</TableHead>
                      <TableHead className="text-zinc-400 text-right">Avg Cost</TableHead>
                      <TableHead className="text-zinc-400 text-right hidden sm:table-cell">Current Price</TableHead>
                      <TableHead className="text-zinc-400 text-right">Market Value</TableHead>
                      <TableHead className="text-zinc-400 text-right hidden md:table-cell">Gain/Loss</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.data.map(h => (
                      <TableRow key={h.id} className="border-zinc-800 hover:bg-zinc-900">
                        <TableCell>
                          <Link
                            href={`/stocks/${h.symbol}`}
                            className="text-white font-mono font-medium hover:text-green-400 transition-colors"
                          >
                            {h.symbol}
                          </Link>
                          <span className="text-zinc-600 text-xs ml-1.5">{h.assetType}</span>
                        </TableCell>
                        <TableCell className="text-right text-zinc-300">{h.quantity}</TableCell>
                        <TableCell className="text-right text-zinc-300">{formatCurrency(h.avgCost)}</TableCell>
                        <TableCell className="text-right text-zinc-300 hidden sm:table-cell">
                          {h.currentPrice != null ? formatCurrency(h.currentPrice) : '—'}
                        </TableCell>
                        <TableCell className="text-right text-white font-medium">
                          {h.marketValue != null ? formatCurrency(h.marketValue) : '—'}
                        </TableCell>
                        <TableCell className={`text-right font-medium hidden md:table-cell ${
                          h.gainLoss == null ? 'text-zinc-500' : h.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {h.gainLoss != null ? `${h.gainLoss >= 0 ? '+' : ''}${formatCurrency(h.gainLoss)}` : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSellTarget(h)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                          >
                            Sell
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </main>

      {sellTarget && (
        <TradeDialog
          symbol={sellTarget.symbol}
          assetType={sellTarget.assetType}
          side="SELL"
          open={!!sellTarget}
          onOpenChange={(open) => !open && setSellTarget(null)}
          onSubmit={handleSell}
          maxQuantity={sellTarget.quantity}
        />
      )}
    </div>
  )
}
