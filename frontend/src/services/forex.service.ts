import api from './api'
import type { IForexPrice } from '@/types/api.types'

export const forexService = {
  getAll:  ()             => api.get<IForexPrice[]>('/api/forex'),
  getPair: (pair: string) => api.get<IForexPrice[]>(`/api/forex/${pair}`),
}
