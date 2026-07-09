'use client'

import React, { createContext, useContext, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from './types'

type SocketContextType = {
  socket: React.MutableRefObject<Socket<ServerToClientEvents, ClientToServerEvents> | null>
}

const SocketContext = createContext<SocketContextType | null>(null)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)

  useEffect(() => {
    // Creating the socket only once
    if (!socket.current) {
      socket.current = io(`${process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL}`, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
      })

      socket.current.on('connect', () => {
        console.log('[SocketContext] Connected to socket server. ID:', socket.current?.id)
      })

      socket.current.on('disconnect', (reason) => {
        console.log('[SocketContext] Socket disconnected:', reason)
      })

      socket.current.on('connect_error', (err) => {
        console.error('[SocketContext] Connection error:', err.message)
      })
    }

    
    return () => {
      if (socket.current) {
        console.log('[SocketContext] Provider unmounting — disconnecting socket.')
        socket.current.disconnect()
        socket.current = null
      }
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = (): SocketContextType => {
  const ctx = useContext(SocketContext)
  if (!ctx) {
    throw new Error('useSocket must be used within a <SocketProvider>')
  }
  return ctx
}
