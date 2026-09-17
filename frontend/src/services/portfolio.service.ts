import api, { cachedGet, invalidateCache } from './api'
import type { IWatchlistItem, IHolding, ITradePayload, ITransaction, IBalance } from '@/types/api.types'

const PORTFOLIO_PREFIX = '/api/portfolio/'

export const portfolioService = {
  getWatchlist:        ()                    => cachedGet<IWatchlistItem[]>('/api/portfolio/watchlist'),
  getHoldings:         ()                    => cachedGet<IHolding[]>('/api/portfolio/holdings'),
  getBalance:          ()                    => cachedGet<IBalance>('/api/portfolio/balance'),
  getTransactions:     ()                    => cachedGet<ITransaction[]>('/api/portfolio/transactions'),

  addToWatchlist: async (symbol: string) => {
    const res = await api.post<IWatchlistItem>('/api/portfolio/watchlist', { symbol })
    invalidateCache(PORTFOLIO_PREFIX)
    return res
  },
  removeFromWatchlist: async (symbol: string) => {
    const res = await api.delete(`/api/portfolio/watchlist/${symbol}`)
    invalidateCache(PORTFOLIO_PREFIX)
    return res
  },
  buy: async (data: ITradePayload) => {
    const res = await api.post('/api/portfolio/buy', data)
    invalidateCache(PORTFOLIO_PREFIX)
    return res
  },
  sell: async (data: ITradePayload) => {
    const res = await api.post('/api/portfolio/sell', data)
    invalidateCache(PORTFOLIO_PREFIX)
    return res
  },
}
