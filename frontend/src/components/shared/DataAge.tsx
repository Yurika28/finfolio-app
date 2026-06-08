'use client'
import { useEffect, useState } from 'react'

interface DataAgeProps {
  timestamp: string
}

const timeAgo = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export const DataAge = ({ timestamp }: DataAgeProps) => {
  const [label, setLabel] = useState(timeAgo(timestamp))

  useEffect(() => {
    const id = setInterval(() => setLabel(timeAgo(timestamp)), 30_000)
    return () => clearInterval(id)
  }, [timestamp])

  return <span className="text-xs text-muted-foreground">Updated {label}</span>
}
