'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from './types'

// Typed declaration for runtime public env injected by layout.tsx (window.__ENV).
// Only NEXT_PUBLIC_ values are ever injected — secrets are never included.
declare global {
  interface Window {
    __ENV?: {
      NEXT_PUBLIC_SOCKET_BACKEND_URL?: string
      NEXT_PUBLIC_PRESET_NAME?: string
      NEXT_PUBLIC_CLOUDINARY_NAME?: string
      NEXT_PUBLIC_CLOUDINARY_BASE_URL?: string
    }
  }
}

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

    // Read from runtime window.__ENV first (set by layout.tsx server component at request time).
    // This lets docker run -e NEXT_PUBLIC_SOCKET_BACKEND_URL=... work without a rebuild.
    const socketUrl =
      (typeof window !== 'undefined' && window.__ENV?.NEXT_PUBLIC_SOCKET_BACKEND_URL) ||
      process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL ||
      ''

    if (!socketUrl) {
      console.warn('[SocketContext] Socket backend URL not configured (SOCKET_BACKEND_URL env var missing). Skipping WebSocket connection.')
      return
    }

    const sock = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    socket.current = sock

    sock.on('connect', () => {
      setIsReady(true)
    })

    sock.on('disconnect', () => {
      setIsReady(false)
    })

    sock.on('connect_error', (err) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[SocketContext] Connection error:', err.message)
      }
    })

    return () => {
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
