import api from './api'
import type { IWatchlistItem, IHolding, IAddHoldingPayload } from '@/types/api.types'

export const portfolioService = {
  getWatchlist:        ()                        => api.get<IWatchlistItem[]>('/api/portfolio/watchlist'),
  addToWatchlist:      (symbol: string)          => api.post<IWatchlistItem>('/api/portfolio/watchlist', { symbol }),
  removeFromWatchlist: (symbol: string)          => api.delete(`/api/portfolio/watchlist/${symbol}`),
  getHoldings:         ()                        => api.get<IHolding[]>('/api/portfolio/holdings'),
  addHolding:          (data: IAddHoldingPayload)=> api.post<IHolding>('/api/portfolio/holdings', data),
}
