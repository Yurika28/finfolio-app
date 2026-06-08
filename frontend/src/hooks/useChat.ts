'use client'
import { useState, useCallback } from 'react'
import { chatService } from '@/services/chat.service'
import type { IChatMessage } from '@/types/api.types'

export const useChat = () => {
  const [messages, setMessages] = useState<IChatMessage[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const send = useCallback(async (text: string) => {
    const userMsg: IChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setError(null)

    try {
      const history = messages.slice(-10)
      const res = await chatService.send(text, history)
      const assistantMsg: IChatMessage = { role: 'assistant', content: res.data.reply }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [messages])

  const clear = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, send, clear }
}
