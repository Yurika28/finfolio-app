'use client'
import Navbar from '@/components/features/navigation-bar'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useNews } from '@/hooks/useNews'
import { formatDate } from '@/utils/formatDate'
import { NewsSentiment } from '@/components/sub-feature/news-sentiment'
import type { IMarketNews } from '@/types/api.types'

function NewsCard({ item }: { item: IMarketNews }) {
  return (
    <a
      href={item.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-2 p-4 rounded-lg border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-colors"
    >
      <div className="flex items-center gap-2 flex-wrap">
        {item.category && (
          <Badge variant="secondary" className="text-xs capitalize">{item.category}</Badge>
        )}
        <span className="text-xs text-zinc-500">{item.source}</span>
      </div>
      <p className="text-sm font-medium text-white leading-snug line-clamp-3">{item.headline}</p>
      <p className="text-xs text-zinc-600 mt-auto">
        {item.datetime ? formatDate(new Date(item.datetime * 1000).toISOString()) : ''}
      </p>
    </a>
  )
}

export default function NewsPage() {
  const { data: news, isLoading, error } = useNews()

  const byCategory = news?.reduce<Record<string, IMarketNews[]>>((acc, item) => {
    const cat = item.category || 'general'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Market News</h1>
          <p className="text-zinc-400 text-sm mt-1">Finance headlines · synced twice daily</p>
        </div>

        {error && <ErrorMessage message={error} />}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-lg" />)}
          </div>
        )}

        {!isLoading && !error && !news?.length && (
          <EmptyState title="No news available" description="Headlines sync at 9am and 9pm" />
        )}

        {!isLoading && byCategory && Object.keys(byCategory).length > 0 && (
          <div className="space-y-10">
            {Object.entries(byCategory).map(([category, items]) => (
              <section key={category}>
                <h2 className="text-lg font-semibold text-white capitalize mb-4 flex items-center gap-2">
                  {category}
                  <span className="text-xs text-zinc-500 font-normal">{items.length} articles</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.slice(0, 6).map(item => <NewsCard key={item.newsId} item={item} />)}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* AV News Sentiment — renders after market news so it doesn't cause layout jump */}
        {!isLoading && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-white mb-4">News Sentiment</h2>
            <NewsSentiment limit={6} />
          </section>
        )}
      </main>
    </div>
  )
}
