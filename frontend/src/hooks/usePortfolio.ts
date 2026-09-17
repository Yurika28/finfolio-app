'use client'
import { useState, useEffect, useCallback } from 'react'
import { portfolioService } from '@/services/portfolio.service'
import type { IWatchlistItem, IHolding, ITradePayload } from '@/types/api.types'

const errorMessage = (err: unknown, fallback: string) => {
  const maybeAxiosError = err as { response?: { data?: { error?: string } } }
  return maybeAxiosError.response?.data?.error ?? fallback
}

export const useWatchlist = () => {
  const [data, setData]         = useState<IWatchlistItem[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    portfolioService.getWatchlist()
      .then(setData)
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
    setError(null)
    portfolioService.getHoldings()
      .then(setData)
      .catch(() => setError('Failed to load holdings'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return { data, isLoading, error, reload: load }
}

export const useBalance = () => {
  const [cashBalance, setCashBalance] = useState<number | null>(null)
  const [isLoading, setLoading]       = useState(true)
  const [error, setError]             = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    portfolioService.getBalance()
      .then(r => setCashBalance(r.cashBalance))
      .catch(() => setError('Failed to load balance'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return { cashBalance, isLoading, error, reload: load }
}

// Shared buy/sell action — used by both the stock/crypto cards and the
// portfolio holdings page, each of which also reloads its own view of state
// (holdings and/or balance) after a successful trade.
export const useTrading = () => {
  const [isTrading, setTrading] = useState(false)

  const buy = useCallback(async (payload: ITradePayload) => {
    setTrading(true)
    try {
      await portfolioService.buy(payload)
    } catch (err) {
      throw new Error(errorMessage(err, 'Buy order failed'))
    } finally {
      setTrading(false)
    }
  }, [])

  const sell = useCallback(async (payload: ITradePayload) => {
    setTrading(true)
    try {
      await portfolioService.sell(payload)
    } catch (err) {
      throw new Error(errorMessage(err, 'Sell order failed'))
    } finally {
      setTrading(false)
    }
  }, [])

  return { buy, sell, isTrading }
}
