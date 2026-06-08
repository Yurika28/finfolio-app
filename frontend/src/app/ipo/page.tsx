'use client'
import Navbar from '@/components/features/navigation-bar'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useIpo } from '@/hooks/useIpo'

const statusVariant = (status: string | null) => {
  if (status === 'priced') return 'default'
  if (status === 'filed')  return 'secondary'
  return 'outline'
}

export default function IpoPage() {
  const { data: ipos, isLoading, error } = useIpo()

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">IPO Calendar</h1>
          <p className="text-zinc-400 text-sm mt-1">Upcoming IPOs · next 30 days</p>
        </div>

        {error && <ErrorMessage message={error} />}

        {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}

        {!isLoading && !error && !ipos?.length && (
          <EmptyState title="No upcoming IPOs" description="Calendar refreshes daily" />
        )}

        {!isLoading && ipos && ipos.length > 0 && (
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Company</TableHead>
                  <TableHead className="text-zinc-400">Symbol</TableHead>
                  <TableHead className="text-zinc-400 hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-zinc-400 text-right hidden md:table-cell">Price</TableHead>
                  <TableHead className="text-zinc-400 text-right hidden md:table-cell">Shares</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ipos.map(ipo => (
                  <TableRow key={ipo.id} className="border-zinc-800  hover:bg-zinc-900">
                    <TableCell className="text-white font-medium">{ipo.name || '—'}</TableCell>
                    <TableCell className="text-zinc-400 font-mono">{ipo.symbol || '—'}</TableCell>
                    <TableCell className="text-zinc-400 hidden sm:table-cell">{ipo.date || '—'}</TableCell>
                    <TableCell className="text-right text-zinc-400 hidden md:table-cell">
                      {ipo.price ? `$${ipo.price.toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell className="text-right text-zinc-400 hidden md:table-cell">
                      {ipo.shares ? (ipo.shares / 1e6).toFixed(1) + 'M' : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(ipo.status)} className="text-xs text-zinc-400 capitalize">
                        {ipo.status || 'unknown'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  )
}
