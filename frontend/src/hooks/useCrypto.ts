'use client'
import { useState, useEffect } from 'react'
import { cryptoService } from '@/services/crypto.service'
import type { ICryptoRate, IHookState } from '@/types/api.types'

export const useCrypto = (): IHookState<ICryptoRate[]> => {
  const [data, setData]         = useState<ICryptoRate[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    cryptoService.getAll()
      .then(r => setData(r.data))
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
      .then(r => setData(r.data))
      .catch(() => setError(`Failed to load ${symbol}`))
      .finally(() => setLoading(false))
  }, [symbol])

  return { data, isLoading, error }
}
