import api, { cachedGet } from './api'
import type { IInsight, IStockInsight } from '@/types/api.types'

export const insightsService = {
  // AI-generated market insight — cheap to cache briefly, still shared globally.
  getMarket:       ()               => cachedGet<IInsight>('/api/insights/market'),
  // Per-symbol AI analysis is a user-triggered action, not a passive read — never cache it.
  getStockAnalysis:(symbol: string) => api.post<IStockInsight>(`/api/insights/stock/${symbol}`),
}
