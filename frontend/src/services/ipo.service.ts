import { cachedGet } from './api'
import type { IIpoCalendar } from '@/types/api.types'

export const ipoService = {
  getCalendar: () => cachedGet<IIpoCalendar[]>('/api/ipo/calendar'),
}
