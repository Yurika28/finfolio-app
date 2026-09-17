import { cachedGet } from './api'
import type { IStockQuote, ICompanyProfile, IWeeklyChart } from '@/types/api.types'

export const stocksService = {
  getAll:     ()                         => cachedGet<IStockQuote[]>('/api/stocks'),
  getQuote:   (symbol: string)           => cachedGet<IStockQuote>(`/api/stocks/${symbol}`),
  getChart:   (symbol: string, limit = 52) => cachedGet<IWeeklyChart[]>(`/api/stocks/${symbol}/chart`, { params: { limit } }),
  getProfile: (symbol: string)           => cachedGet<ICompanyProfile>(`/api/stocks/${symbol}/profile`),
}
