import { Badge } from '@/components/ui/badge'

interface PriceBadgeProps {
  value: number
  suffix?: string
}

export const PriceBadge = ({ value, suffix = '%' }: PriceBadgeProps) => (
  <Badge variant={value >= 0 ? 'default' : 'destructive'}>
    {value >= 0 ? '+' : ''}{value.toFixed(2)}{suffix}
  </Badge>
)
