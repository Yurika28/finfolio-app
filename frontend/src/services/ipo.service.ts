import api from './api'
import type { IIpoCalendar } from '@/types/api.types'

export const ipoService = {
  getCalendar: () => api.get<IIpoCalendar[]>('/api/ipo/calendar'),
}
