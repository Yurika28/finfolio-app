import api from './api'
import type { IMarketNews, ICompanyNews, INewsSentiment } from '@/types/api.types'

export const newsService = {
  getMarket:    ()               => api.get<IMarketNews[]>('/api/news'),
  getCompany:   (symbol: string) => api.get<ICompanyNews[]>(`/api/news/${symbol}`),
  getSentiment: ()               => api.get<INewsSentiment[]>('/api/news/sentiment'),
}
