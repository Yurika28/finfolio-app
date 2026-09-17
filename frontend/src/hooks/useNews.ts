'use client'
import { useState, useEffect } from 'react'
import { newsService } from '@/services/news.service'
import type { IMarketNews, ICompanyNews, INewsSentiment, IHookState } from '@/types/api.types'

export const useNews = (): IHookState<IMarketNews[]> => {
  const [data, setData]         = useState<IMarketNews[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    newsService.getMarket()
      .then(setData)
      .catch(() => setError('Failed to load news'))
      .finally(() => setLoading(false))
  }, [])

  return { data, isLoading, error }
}

export const useCompanyNews = (symbol: string): IHookState<ICompanyNews[]> => {
  const [data, setData]         = useState<ICompanyNews[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    newsService.getCompany(symbol)
      .then(setData)
      .catch(() => setError('Failed to load company news'))
      .finally(() => setLoading(false))
  }, [symbol])

  return { data, isLoading, error }
}

export const useNewsSentiment = (params?: { symbol?: string; symbolPrefix?: string }): IHookState<INewsSentiment[]> => {
  const [data, setData]         = useState<INewsSentiment[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const { symbol, symbolPrefix } = params ?? {}

  useEffect(() => {
    newsService.getSentiment({ symbol, symbolPrefix })
      .then(setData)
      .catch(() => setError('Failed to load news sentiment'))
      .finally(() => setLoading(false))
  }, [symbol, symbolPrefix])

  return { data, isLoading, error }
}
