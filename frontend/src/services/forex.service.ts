import { cachedGet } from './api'
import type { IForexPrice } from '@/types/api.types'

export const forexService = {
  getAll:  ()             => cachedGet<IForexPrice[]>('/api/forex'),
  getPair: (pair: string) => cachedGet<IForexPrice[]>(`/api/forex/${pair}`),
}
