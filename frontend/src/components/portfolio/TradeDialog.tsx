'use client'
import { useState, FormEvent } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AssetType, TradeSide } from '@/types/api.types'

interface Props {
  symbol:        string
  assetType:     AssetType
  side:          TradeSide
  open:          boolean
  onOpenChange:  (open: boolean) => void
  onSubmit:      (quantity: number) => Promise<void>
  maxQuantity?:  number // caps input for a SELL — you can't sell more than you hold
}

// Quantity-only order ticket: price is resolved server-side from live market
// data at execution time, so the user never types a price here.
export function TradeDialog({ symbol, assetType, side, open, onOpenChange, onSubmit, maxQuantity }: Props) {
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onSubmit(parseFloat(quantity))
      onOpenChange(false)
      setQuantity('')
    } catch (err) {
      setError(err instanceof Error ? err.message : `${side === 'BUY' ? 'Buy' : 'Sell'} order failed`)
    } finally {
      setLoading(false)
    }
  }

  const isBuy = side === 'BUY'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>{isBuy ? 'Buy' : 'Sell'} {symbol}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-zinc-300 text-sm">Quantity</Label>
            <Input
              type="number"
              step="any"
              min="0"
              max={maxQuantity}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="10"
              required
              autoFocus
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            {maxQuantity != null && (
              <p className="text-xs text-zinc-500">You hold {maxQuantity}</p>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            Executes at the current market price — this is a simulated (paper) trade, no real funds move.
          </p>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold ${
              isBuy
                ? 'bg-green-500 hover:bg-green-600 text-black'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {loading ? 'Submitting…' : isBuy ? 'Buy' : 'Sell'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
