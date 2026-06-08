'use client'
import { useState, useEffect } from 'react'
import { ipoService } from '@/services/ipo.service'
import type { IIpoCalendar, IHookState } from '@/types/api.types'

export const useIpo = (): IHookState<IIpoCalendar[]> => {
  const [data, setData]         = useState<IIpoCalendar[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    ipoService.getCalendar()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load IPO calendar'))
      .finally(() => setLoading(false))
  }, [])

  return { data, isLoading, error }
}
