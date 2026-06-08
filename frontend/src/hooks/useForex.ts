'use client'
import { useState, useEffect } from 'react'
import { forexService } from '@/services/forex.service'
import type { IForexPrice, IHookState } from '@/types/api.types'

export const useForex = (): IHookState<IForexPrice[]> => {
  const [data, setData]         = useState<IForexPrice[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    forexService.getAll()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load forex rates'))
      .finally(() => setLoading(false))
  }, [])

  return { data, isLoading, error }
}

export const useForexPair = (pair: string): IHookState<IForexPrice[]> => {
  const [data, setData]         = useState<IForexPrice[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    forexService.getPair(pair)
      .then(r => setData(r.data))
      .catch(() => setError(`Failed to load ${pair}`))
      .finally(() => setLoading(false))
  }, [pair])

  return { data, isLoading, error }
}
