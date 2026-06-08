'use client'
import Navbar from '@/components/features/navigation-bar'
import { CryptoCard } from '@/components/crypto/CryptoCard'
import { LoadingGrid } from '@/components/shared/LoadingCard'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState'
import { useCrypto } from '@/hooks/useCrypto'

export default function CryptoPage() {
  const { data: rates, isLoading, error } = useCrypto()

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Crypto</h1>
          <p className="text-zinc-400 text-sm mt-1">Live rates vs USD · synced twice daily</p>
        </div>

        {error && <ErrorMessage message={error} />}
        {isLoading && <LoadingGrid count={6} />}
        {!isLoading && !error && !rates?.length && (
          <EmptyState title="No crypto data yet" description="Rates sync at 8am and 8pm" />
        )}
        {!isLoading && rates && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rates.map(r => <CryptoCard key={r.fromSymbol} rate={r} />)}
          </div>
        )}
      </main>
    </div>
  )
}
