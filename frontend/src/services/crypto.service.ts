import { cachedGet } from './api'
import type { ICryptoRate, ICryptoChart } from '@/types/api.types'

export const cryptoService = {
  getAll:   ()                           => cachedGet<ICryptoRate[]>('/api/crypto'),
  getOne:   (symbol: string)             => cachedGet<ICryptoRate>(`/api/crypto/${symbol}`),
  getChart: (symbol: string, limit = 365) => cachedGet<ICryptoChart[]>(`/api/crypto/${symbol}/chart`, { params: { limit } }),
}
