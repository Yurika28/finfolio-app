import api from './api'
import type { IStockQuote, ICompanyProfile, IWeeklyChart } from '@/types/api.types'

export const stocksService = {
  getAll:     ()                         => api.get<IStockQuote[]>('/api/stocks'),
  getQuote:   (symbol: string)           => api.get<IStockQuote>(`/api/stocks/${symbol}`),
  getChart:   (symbol: string, limit = 52) => api.get<IWeeklyChart[]>(`/api/stocks/${symbol}/chart`, { params: { limit } }),
  getProfile: (symbol: string)           => api.get<ICompanyProfile>(`/api/stocks/${symbol}/profile`),
}
