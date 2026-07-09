'use client'

import React from 'react'
import NavUserIcon from '@/components/NavUserIcon'
import ProblemNavIcon from '@/components/ProblemNavIcon'
import RunButton from '@/components/RunButton'
import SplitPage from '@/components/SplitPage'
import Stopwatch from '@/components/Stopwatch'
import { ProblemInfo } from '@/app/problems/[...slug]/page'

/**
 * Renders the problem workspace UI: navbar + split pane.
 * 
 * Socket is provided by app/problems/layout.tsx (SocketProvider lives there).
 * codeResponse listener is also in layout.tsx.
 * RunButton uses useSocket() to get the socket ref for emitting.
 */
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

export default ProblemLayout
