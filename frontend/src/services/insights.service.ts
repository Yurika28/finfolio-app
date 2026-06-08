import api from './api'
import type { IInsight, IStockInsight } from '@/types/api.types'

export const insightsService = {
  getMarket:       ()               => api.get<IInsight>('/api/insights/market'),
  getStockAnalysis:(symbol: string) => api.post<IStockInsight>(`/api/insights/stock/${symbol}`),
}
