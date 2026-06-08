import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const LoadingCard = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-4 w-16" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
)

export const LoadingGrid = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => <LoadingCard key={i} />)}
  </div>
)
