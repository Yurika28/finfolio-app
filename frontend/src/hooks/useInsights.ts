'use client'
import { useState, useCallback } from 'react'
import { insightsService } from '@/services/insights.service'
import type { IInsight, IStockInsight, IHookState } from '@/types/api.types'

export const useMarketInsight = (): IHookState<IInsight> & { fetch: () => void } => {
  const [data, setData]         = useState<IInsight | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const fetch = useCallback(() => {
    setLoading(true)
    setError(null)
    insightsService.getMarket()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load market insight'))
      .finally(() => setLoading(false))
  }, [])

  return { data, isLoading, error, fetch }
}

export const useStockInsight = (): IHookState<IStockInsight> & { analyze: (symbol: string) => void } => {
  const [data, setData]         = useState<IStockInsight | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const analyze = useCallback((symbol: string) => {
    setLoading(true)
    setError(null)
    insightsService.getStockAnalysis(symbol)
      .then(r => setData(r.data))
      .catch(() => setError(`Failed to analyze ${symbol}`))
      .finally(() => setLoading(false))
  }, [])

  return { data, isLoading, error, analyze }
}
