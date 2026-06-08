'use client'
import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useStockChart } from '@/hooks/useStocks'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDateShort } from '@/utils/formatDate'

const RANGES = [
  { label: '1M',  weeks: 4   },
  { label: '6M',  weeks: 26  },
  { label: '1Y',  weeks: 52  },
  { label: '5Y',  weeks: 260 },
  { label: 'All', weeks: 520 },
] as const

type RangeLabel = typeof RANGES[number]['label']

interface StockChartProps {
  symbol: string
}

export const StockChart = ({ symbol }: StockChartProps) => {
  const [range, setRange] = useState<RangeLabel>('1Y')
  const limit = RANGES.find(r => r.label === range)!.weeks
  const { data, isLoading, error } = useStockChart(symbol, limit)

  return (
    <div>
      {/* Range selector */}
      <div className="flex items-center gap-1 mb-4">
        {RANGES.map(r => (
          <button
            key={r.label}
            onClick={() => setRange(r.label)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              range === r.label
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {isLoading && <Skeleton className="h-64 w-full rounded-lg" />}

      {!isLoading && (error || !data?.length) && (
        <EmptyState title="No chart data" description="Chart data syncs nightly at 2am" />
      )}

      {!isLoading && data && data.length > 0 && (() => {
        const chartData = [...data].reverse().map(row => ({
          date: formatDateShort(row.date),
          close: row.close,
          high:  row.high,
          low:   row.low,
        }))
        const minVal = Math.min(...chartData.map(d => d.low))
        const maxVal = Math.max(...chartData.map(d => d.high))

        return (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minVal * 0.98, maxVal * 1.02]}
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `$${v.toFixed(0)}`}
                width={55}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#22c55e' }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, 'Close']}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#22c55e"
                strokeWidth={2}
                fill={`url(#grad-${symbol})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      })()}
    </div>
  )
}
