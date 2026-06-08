import api from './api'
import type { ICryptoRate } from '@/types/api.types'

export const cryptoService = {
  getAll: ()               => api.get<ICryptoRate[]>('/api/crypto'),
  getOne: (symbol: string) => api.get<ICryptoRate>(`/api/crypto/${symbol}`),
}
