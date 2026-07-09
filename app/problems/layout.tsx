'use client'

/**
 * This layout wraps ALL /problems/** pages.
 * 
 * CRITICAL: Next.js layout components are NOT unmounted on navigation between
 * routes that share the layout. This means SocketProvider lives here and the
 * socket connection persists across description/testcases/submissions tab switches.
 * 
 * This is the correct place to own the single codeResponse listener —
 * it will never be torn down by tab navigation.
 */

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SocketProvider, useSocket } from '@/lib/SocketContext'
import { useRunCallbackStore } from '@/lib/store'
import { CodeCallback } from '@/lib/types'

// Inner component: has access to SocketContext and registers the codeResponse listener.
// isReady dependency guarantees we only register AFTER the socket has fully connected.
const SocketResponseListener = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { socket, isReady } = useSocket()
  const updateResponseLoading = useRunCallbackStore((state) => state.updateResponseLoading)
  const updateRunResponse = useRunCallbackStore((state) => state.updateRunResponse)

  // Use refs so the handler always calls the latest router/store without stale closures
  const routerRef = useRef(router)
  const updateLoadingRef = useRef(updateResponseLoading)
  const updateResponseRef = useRef(updateRunResponse)

  useEffect(() => { routerRef.current = router }, [router])
  useEffect(() => { updateLoadingRef.current = updateResponseLoading }, [updateResponseLoading])
  useEffect(() => { updateResponseRef.current = updateRunResponse }, [updateRunResponse])

  useEffect(() => {
    // Only register listener once the socket is actually connected.
    // isReady becomes true after socket 'connect' fires (set in SocketProvider).
    if (!isReady || !socket.current) return

    const sock = socket.current

    const handleCodeResponse = (obj: CodeCallback) => {
      if (!obj) return
      console.log('[ProblemsLayout] codeResponse received for socket', sock.id, ':', obj.status)
      updateLoadingRef.current(false)
      updateResponseRef.current(obj)
      if (obj.runnerType === 'submit') {
        routerRef.current.push(`/problems/${obj.problemURL}/submissions`)
      } else {
        routerRef.current.push(`/problems/${obj.problemURL}/testcases`)
      }
    }

    console.log('[ProblemsLayout] Registering codeResponse listener. Socket ID:', sock.id)
    sock.off('codeResponse', handleCodeResponse)
    sock.on('codeResponse', handleCodeResponse)

    return () => {
      console.log('[ProblemsLayout] Removing codeResponse listener.')
      sock.off('codeResponse', handleCodeResponse)
    }
  }, [isReady, socket]) // Re-run when socket connects/reconnects

  return <>{children}</>
}

// Outer: provides the socket context to the entire /problems/** subtree.
const ProblemsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SocketProvider>
      <SocketResponseListener>
        {children}
      </SocketResponseListener>
    </SocketProvider>
  )
}

export default ProblemsLayout
