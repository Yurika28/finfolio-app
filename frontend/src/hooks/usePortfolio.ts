'use client'
import { useState, useEffect, useCallback } from 'react'
import { portfolioService } from '@/services/portfolio.service'
import type { IWatchlistItem, IHolding, IAddHoldingPayload } from '@/types/api.types'

export const useWatchlist = () => {
  const [data, setData]         = useState<IWatchlistItem[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    portfolioService.getWatchlist()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load watchlist'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (symbol: string) => {
    await portfolioService.addToWatchlist(symbol)
    load()
  }, [load])

  const remove = useCallback(async (symbol: string) => {
    await portfolioService.removeFromWatchlist(symbol)
    setData(prev => prev?.filter(w => w.symbol !== symbol) ?? null)
  }, [])

  return { data, isLoading, error, add, remove, reload: load }
}

export const useHoldings = () => {
  const [data, setData]         = useState<IHolding[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    portfolioService.getHoldings()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load holdings'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (payload: IAddHoldingPayload) => {
    await portfolioService.addHolding(payload)
    load()
  }, [load])

  return { data, isLoading, error, add, reload: load }
}
