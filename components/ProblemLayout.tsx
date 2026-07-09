'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavUserIcon from '@/components/NavUserIcon'
import ProblemNavIcon from '@/components/ProblemNavIcon'
import RunButton from '@/components/RunButton'
import SplitPage from '@/components/SplitPage'
import Stopwatch from '@/components/Stopwatch'
import { SocketProvider, useSocket } from '@/lib/SocketContext'
import { useRunCallbackStore } from '@/lib/store'
import { ProblemInfo } from '@/app/problems/[...slug]/page'

// Inner component that has access to the socket context
const ProblemLayoutInner = ({
  problemInfo,
  pageType,
  problemURL,
}: {
  problemInfo: ProblemInfo
  pageType: string
  problemURL: string
}) => {
  const router = useRouter()
  const { socket } = useSocket()
  const updateResponseLoading = useRunCallbackStore((state) => state.updateResponseLoading)
  const updateRunResponse = useRunCallbackStore((state) => state.updateRunResponse)

  useEffect(() => {
    const sock = socket.current
    if (!sock) return

    const handleCodeResponse = (obj: Parameters<typeof updateRunResponse>[0]) => {
      if (!obj) return
      console.log('[ProblemLayout] codeResponse received:', obj)
      updateResponseLoading(false)
      updateRunResponse(obj)
      if (obj.runnerType === 'submit') {
        router.push(`/problems/${problemURL}/submissions`)
      } else {
        router.push(`/problems/${problemURL}/testcases`)
      }
    }

    // Register listener. Socket.io deduplicates listeners automatically if the same
    // function reference is passed, but we use off/on to be safe across re-renders.
    sock.off('codeResponse', handleCodeResponse)
    sock.on('codeResponse', handleCodeResponse)

    return () => {
      sock.off('codeResponse', handleCodeResponse)
    }
  }, [socket, problemURL, router, updateResponseLoading, updateRunResponse])

  return (
    <div>
      {/* Navbar */}
      <div className="bg-[#0f0f0f] h-16 flex items-center p-3 justify-between">
        <ProblemNavIcon />

        <div className="flex items-center justify-center gap-2 flex-none">
          <RunButton problemURL={problemURL} topics={problemInfo.topics} />
          <Stopwatch />
        </div>

        <div className="flex-1 flex justify-end items-center gap-10">
          <NavUserIcon />
          <div className="cursor-pointer items-center justify-center p-3 text-[#ffa600d1] rounded-xl bg-[#ffa60013] hidden c-664:block">
            Premium
          </div>
        </div>
      </div>

      <SplitPage problemInfo={problemInfo} pageType={pageType} problemURL={problemURL} />
    </div>
  )
}

// Outer component that provides the socket context
const ProblemLayout = ({
  problemInfo,
  pageType,
  problemURL,
}: {
  problemInfo: ProblemInfo | null
  pageType: string
  problemURL: string
}) => {
  if (!problemInfo) {
    return <>Loading...</>
  }

  return (
    <SocketProvider>
      <ProblemLayoutInner
        problemInfo={problemInfo}
        pageType={pageType}
        problemURL={problemURL}
      />
    </SocketProvider>
  )
}

export default ProblemLayout
