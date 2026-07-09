'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from './types'

type SocketContextType = {
  socket: React.MutableRefObject<Socket<ServerToClientEvents, ClientToServerEvents> | null>
  isReady: boolean
}

const SocketContext = createContext<SocketContextType | null>(null)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  // isReady triggers re-renders in consumers so they can register listeners AFTER connect
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Guard: only create once (in case of StrictMode double-invoke)
    if (socket.current) return

    const sock = io(`${process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL}`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    socket.current = sock

    sock.on('connect', () => {
      console.log('[SocketContext] Connected. ID:', sock.id)
      setIsReady(true)
    })

    sock.on('disconnect', (reason) => {
      console.log('[SocketContext] Disconnected:', reason)
      setIsReady(false)
    })

    sock.on('connect_error', (err) => {
      console.error('[SocketContext] Connection error:', err.message)
    })

    return () => {
      // Only runs when this Provider truly unmounts (user leaves /problems entirely)
      console.log('[SocketContext] Provider unmounting — disconnecting socket.')
      sock.disconnect()
      socket.current = null
      setIsReady(false)
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isReady }}>
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
