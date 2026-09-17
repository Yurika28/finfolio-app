'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketState {
  socket: Socket | null
  isConnected: boolean
}

export const SocketContext = createContext<SocketState>({ socket: null, isConnected: false })

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket]           = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL
    if (!wsUrl) {
      // Fail loudly for developers instead of silently trying to connect to `undefined`.
      console.error('NEXT_PUBLIC_WS_URL is not set — live price updates are disabled')
      return
    }

    const s = io(wsUrl, { transports: ['websocket'] })
    s.on('connect', () => setIsConnected(true))
    s.on('disconnect', () => setIsConnected(false))
    s.on('connect_error', (err) => {
      console.error('Socket connection failed:', err.message)
      setIsConnected(false)
    })

    setSocket(s)
    return () => { s.disconnect() }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
