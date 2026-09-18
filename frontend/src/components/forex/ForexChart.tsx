'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useForexPair } from '@/hooks/useForex'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDateShort } from '@/utils/formatDate'

interface ForexChartProps {
  fromSymbol: string
  toSymbol: string
}

// Last 30 days of OHLC for a single pair — the backend only ever returns 30
// rows for /api/forex/:pair, so there's no range selector like CryptoChart.
export const ForexChart = ({ fromSymbol, toSymbol }: ForexChartProps) => {
  const pair = `${fromSymbol}-${toSymbol}`
  const { data, isLoading, error } = useForexPair(pair)

  return (
    <div>
      {isLoading && <Skeleton className="h-64 w-full rounded-lg" />}

      {!isLoading && (error || !data?.length) && (
        <EmptyState title="No chart data" description="Rates sync at 9am and 9pm" />
      )}

      {!isLoading && data && data.length > 0 && (() => {
        const chartData = [...data]
          .reverse()
          .map(row => ({
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
                <linearGradient id={`grad-${pair}`} x1="0" y1="0" x2="0" y2="1">
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
                domain={[minVal * 0.998, maxVal * 1.002]}
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => v.toFixed(4)}
                width={65}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#22c55e' }}
                formatter={(v: number) => [v.toFixed(4), 'Close']}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#22c55e"
                strokeWidth={2}
                fill={`url(#grad-${pair})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      })()}
    </div>
  )
}
