import api from './api'
import type { IChatMessage, IChatResponse } from '@/types/api.types'

export const chatService = {
  send: (message: string, history: IChatMessage[]) =>
    api.post<IChatResponse>('/api/chat', { message, history }),
}
