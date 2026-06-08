'use client'
import { useState } from 'react'
import Navbar from '@/components/features/navigation-bar'
import { StockCard } from '@/components/stocks/StockCard'
import { StockTable } from '@/components/stocks/StockTable'
import { LoadingGrid } from '@/components/shared/LoadingCard'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useStocks } from '@/hooks/useStocks'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function StocksPage() {
  const { data: stocks, isLoading, error } = useStocks()
  const [view, setView] = useState<'grid' | 'table'>('grid')

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Stocks</h1>
            <p className="text-zinc-400 text-sm mt-1">US market prices · updated hourly</p>
          </div>
          <Tabs value={view} onValueChange={v => setView(v as 'grid' | 'table')}>
            <TabsList className="bg-zinc-300 border border-zinc-600">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {error && <ErrorMessage message={error} />}

        {isLoading && <LoadingGrid count={10} />}

        {!isLoading && stocks && view === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stocks.map(s => <StockCard key={s.symbol} stock={s} />)}
          </div>
        )}

        {!isLoading && stocks && view === 'table' && (
          <StockTable stocks={stocks} />
        )}
      </main>
    </div>
  )
}
