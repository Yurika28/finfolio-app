'use client'
import { useState, FormEvent } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { IAddHoldingPayload } from '@/types/api.types'

interface Props {
  onAdd:     (payload: IAddHoldingPayload) => Promise<void>
  symbol?:   string
  open?:     boolean
  onOpenChange?: (open: boolean) => void
  trigger?:  React.ReactNode
}

export function AddHoldingDialog({ onAdd, symbol: initialSymbol = '', open: controlledOpen, onOpenChange, trigger }: Props) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open    = controlledOpen ?? internalOpen
  const setOpen = onOpenChange   ?? setInternalOpen

  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [form, setForm]     = useState({ symbol: initialSymbol, shares: '', buyPrice: '', buyDate: '' })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onAdd({
        symbol: form.symbol.toUpperCase(),
        shares: parseFloat(form.shares),
        buyPrice: parseFloat(form.buyPrice),
        buyDate: form.buyDate,
      })
      setOpen(false)
      setForm({ symbol: '', shares: '', buyPrice: '', buyDate: '' })
    } catch {
      setError('Failed to add holding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold">
            + Add Holding
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Add Holding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-zinc-300 text-sm">Symbol</Label>
            <Input
              value={form.symbol}
              onChange={set('symbol')}
              placeholder="AAPL"
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-zinc-300 text-sm">Shares</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={form.shares}
                onChange={set('shares')}
                placeholder="10"
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-zinc-300 text-sm">Buy Price ($)</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={form.buyPrice}
                onChange={set('buyPrice')}
                placeholder="150.00"
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-zinc-300 text-sm">Buy Date</Label>
            <Input
              type="date"
              value={form.buyDate}
              onChange={set('buyDate')}
              required
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
          >
            {loading ? 'Adding…' : 'Add Holding'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
