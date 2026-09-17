'use client'
import { useState, useEffect } from 'react'
import { cryptoService } from '@/services/crypto.service'
import type { ICryptoRate, ICryptoChart, IHookState } from '@/types/api.types'

export const useCrypto = (): IHookState<ICryptoRate[]> => {
  const [data, setData]         = useState<ICryptoRate[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    cryptoService.getAll()
      .then(setData)
      .catch(() => setError('Failed to load crypto rates'))
      .finally(() => setLoading(false))
  }, [])

  return { data, isLoading, error }
}

export const useCryptoOne = (symbol: string): IHookState<ICryptoRate> => {
  const [data, setData]         = useState<ICryptoRate | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    cryptoService.getOne(symbol)
      .then(setData)
      .catch(() => setError(`Failed to load ${symbol}`))
      .finally(() => setLoading(false))
  }, [symbol])

  return { data, isLoading, error }
}

export const useCryptoChart = (symbol: string, limit = 365): IHookState<ICryptoChart[]> => {
  const [data, setData]         = useState<ICryptoChart[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    cryptoService.getChart(symbol, limit)
      .then(setData)
      .catch(() => setError('No chart data yet'))
      .finally(() => setLoading(false))
  }, [symbol, limit])

  return { data, isLoading, error }
}
