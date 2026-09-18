'use client'
import { useState } from 'react'
import Navbar from '@/components/features/navigation-bar'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useForex } from '@/hooks/useForex'
import { ForexChart } from '@/components/forex/ForexChart'
import { formatDate } from '@/utils/formatDate'

export default function ForexPage() {
  const { data: rates, isLoading, error } = useForex()
  const [expanded, setExpanded] = useState<string | null>(null)

  // Get latest rate per pair
  const latestByPair = rates?.reduce<Record<string, typeof rates[0]>>((acc, r) => {
    const key = `${r.fromSymbol}-${r.toSymbol}`
    if (!acc[key] || r.date > acc[key].date) acc[key] = r
    return acc
  }, {})

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Forex</h1>
          <p className="text-zinc-400 text-sm mt-1">Currency pairs · synced twice daily</p>
        </div>

        {error && <ErrorMessage message={error} />}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        )}
        {!isLoading && !error && !latestByPair && (
          <EmptyState title="No forex data yet" description="Rates sync at 9am and 9pm" />
        )}
        {!isLoading && latestByPair && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(latestByPair).map(r => {
              const key = `${r.fromSymbol}-${r.toSymbol}`
              const isOpen = expanded === key
              return (
                <Card
                  key={key}
                  onClick={() => setExpanded(isOpen ? null : key)}
                  className={`bg-zinc-900 border-zinc-800 cursor-pointer transition-colors hover:border-zinc-700 ${
                    isOpen ? 'sm:col-span-2 lg:col-span-3 border-green-500/50' : ''
                  }`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">
                      {r.fromSymbol} / {r.toSymbol}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-white">{r.close.toFixed(4)}</p>
                    <dl className="grid grid-cols-3 gap-2 mt-3 text-xs">
                      {[['Open', r.open], ['High', r.high], ['Low', r.low]].map(([l, v]) => (
                        <div key={l as string}>
                          <dt className="text-zinc-500">{l}</dt>
                          <dd className="text-white font-mono">{(v as number).toFixed(4)}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="text-xs text-zinc-500 mt-2">{formatDate(r.date)}</p>

                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-zinc-800" onClick={e => e.stopPropagation()}>
                        <ForexChart fromSymbol={r.fromSymbol} toSymbol={r.toSymbol} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
