import { cachedGet } from './api'
import type { IMarketNews, ICompanyNews, INewsSentiment } from '@/types/api.types'

interface ISentimentParams {
  symbol?: string
  symbolPrefix?: string
}

export const newsService = {
  getMarket:    ()               => cachedGet<IMarketNews[]>('/api/news'),
  getCompany:   (symbol: string) => cachedGet<ICompanyNews[]>(`/api/news/${symbol}`),
  getSentiment: (params?: ISentimentParams) => cachedGet<INewsSentiment[]>('/api/news/sentiment', { params }),
}
