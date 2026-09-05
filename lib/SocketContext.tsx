'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from './types'
import { useSession } from 'next-auth/react'

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

// ---------------------------------------------------------------------------
// Module-level singleton
// ---------------------------------------------------------------------------
let _socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
let _activeToken: string | null = null

function getSocketUrl(): string {
  return (
    (typeof window !== 'undefined' && window.__ENV?.NEXT_PUBLIC_SOCKET_BACKEND_URL) ||
    process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL ||
    ''
  )
}

/**
 * Ensures exactly one live socket for the given token.
 * If the token hasn't changed, returns the existing socket without touching it.
 * If the token changed (new login / different user), disconnects the old socket first.
 */
function acquireSocket(token: string): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (_socket && _activeToken === token) {
    return _socket
  }

  if (_socket) {
    _socket.disconnect()
    _socket = null
    _activeToken = null
  }

  const url = getSocketUrl()
  _socket = io(url, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: { token },
  })
  _activeToken = token
  return _socket
}

function releaseSocket(): void {
  if (_socket) {
    _socket.disconnect()
    _socket = null
    _activeToken = null
  }
}

type SocketContextType = {
  socket: React.MutableRefObject<Socket<ServerToClientEvents, ClientToServerEvents> | null>
  isReady: boolean
}

const SocketContext = createContext<SocketContextType | null>(null)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const session = useSession()
  const socket = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [isReady, setIsReady] = useState(false)

  const userToken: string | undefined = session.data?.user?.token

  useEffect(() => {
    if (session.status === 'loading') return

    // User is not authenticated, release any existing socket.
    if (session.status !== 'authenticated' || !userToken) {
      releaseSocket()
      socket.current = null
      setIsReady(false)
      return
    }

    const socketUrl = getSocketUrl()
    if (!socketUrl) {
      console.warn('[SocketContext] Socket backend URL not configured. Skipping connection.')
      return
    }

    const sock = acquireSocket(userToken)
    socket.current = sock

    setIsReady(sock.connected)

    const handleConnect = () => setIsReady(true)
    const handleDisconnect = () => setIsReady(false)
    const handleError = (err: Error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[SocketContext] Connection error:', err.message)
      }
    }

    sock.on('connect', handleConnect)
    sock.on('disconnect', handleDisconnect)
    sock.on('connect_error', handleError)

    return () => {
      sock.off('connect', handleConnect)
      sock.off('disconnect', handleDisconnect)
      sock.off('connect_error', handleError)
    }
  }, [session.status, userToken])

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
