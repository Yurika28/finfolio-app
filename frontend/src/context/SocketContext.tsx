'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export const SocketContext = createContext<Socket | null>(null)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_WS_URL!, { transports: ['websocket'] })
    setSocket(s)
    return () => { s.disconnect() }
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
