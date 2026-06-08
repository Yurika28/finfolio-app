'use client'
import { useState, useEffect } from 'react'
import { stocksService } from '@/services/stocks.service'
import type { IStockQuote, ICompanyProfile, IWeeklyChart, IHookState } from '@/types/api.types'

export const useStocks = (): IHookState<IStockQuote[]> => {
  const [data, setData]       = useState<IStockQuote[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    stocksService.getAll()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load stocks'))
      .finally(() => setLoading(false))
  }, [])

  return { data, isLoading, error }
}

export const useStockQuote = (symbol: string): IHookState<IStockQuote> => {
  const [data, setData]       = useState<IStockQuote | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    stocksService.getQuote(symbol)
      .then(r => setData(r.data))
      .catch(() => setError(`Failed to load ${symbol}`))
      .finally(() => setLoading(false))
  }, [symbol])

  return { data, isLoading, error }
}

export const useStockProfile = (symbol: string): IHookState<ICompanyProfile> => {
  const [data, setData]       = useState<ICompanyProfile | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    stocksService.getProfile(symbol)
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [symbol])

  return { data, isLoading, error }
}

export const useStockChart = (symbol: string, limit = 52): IHookState<IWeeklyChart[]> => {
  const [data, setData]       = useState<IWeeklyChart[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    stocksService.getChart(symbol, limit)
      .then(r => setData(r.data))
      .catch(() => setError('No chart data yet'))
      .finally(() => setLoading(false))
  }, [symbol, limit])

  return { data, isLoading, error }
}
