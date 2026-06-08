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
      .then(r => setData(r.data))
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
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load company news'))
      .finally(() => setLoading(false))
  }, [symbol])

  return { data, isLoading, error }
}

export const useNewsSentiment = (): IHookState<INewsSentiment[]> => {
  const [data, setData]         = useState<INewsSentiment[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    newsService.getSentiment()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load news sentiment'))
      .finally(() => setLoading(false))
  }, [])

  return { data, isLoading, error }
}
