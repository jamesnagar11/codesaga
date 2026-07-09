"use client"
import { useCodeStore, useProblemsData, useRunCallbackStore } from '@/lib/store'
import { useSocket } from '@/lib/SocketContext'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import React, { useEffect } from 'react'

const RunButton = ({ problemURL, topics }: { problemURL: string, topics: string[] | undefined }) => {
  const session = useSession()
  const { socket } = useSocket()
  const snippets = useCodeStore(state => state.snippets)
  const currentLanguage = useCodeStore(state => state.userCodeLanguage)
  const updateResponseLoading = useRunCallbackStore(state => state.updateResponseLoading)
  const problemsDifficultyMap = useProblemsData(state => state.problemsDifficultyMap)
  const addProblemsDifficulty = useProblemsData(state => state.addProblemsDifficulty)

  // Fetch difficulty once if not already cached
  useEffect(() => {
    if (!problemsDifficultyMap[problemURL]) {
      axios.get('/api/getdifficulty/' + problemURL).then(res => {
        if (res.data && res.data.difficulty) {
          addProblemsDifficulty(problemURL, res.data.difficulty)
        }
      }).catch(console.error)
    }
  }, [problemURL, problemsDifficultyMap, addProblemsDifficulty])

  const handleRun = () => {
    if (!snippets[problemURL]) {
      console.log('No snippet found for this problem')
      return
    }
    if (!snippets[problemURL][currentLanguage]) {
      console.log('No snippet found for this language')
      return
    }
    if (!session.data || !session.data.user) {
      alert('First you have to login')
      return
    }
    if (!socket.current || !socket.current.connected) {
      alert('Server down, refresh and try again after a while')
      return
    }
    if (!problemsDifficultyMap[problemURL]) {
      alert('Difficulty not loaded yet, try again...')
      return
    }

    const socketId = socket.current.id
    if (!socketId) {
      alert('Socket not ready yet, try again...')
      return
    }

    const dateTime = new Date()
    updateResponseLoading(true)
    socket.current.emit('codeRequestQueue', {
      language: currentLanguage,
      code: snippets[problemURL][currentLanguage].code,
      socketId: socketId,
      problemTitle: problemURL,
      runnerType: 'run',
      submissionTime: dateTime,
      // @ts-expect-error: userId is provided at runtime during sign-in
      userId: session.data.user.id,
      problemURL: problemURL,
      difficulty: problemsDifficultyMap[problemURL],
      topics: topics,
    })
  }

  const handleSubmit = () => {
    if (!snippets[problemURL]) {
      console.log('No snippet found for this problem')
      return
    }
    if (!snippets[problemURL][currentLanguage]) {
      console.log('No snippet found for this language')
      return
    }
    if (!session.data || !session.data.user) {
      alert('First you have to login')
      return
    }
    if (!socket.current || !socket.current.connected) {
      alert('Server down, refresh page and try again after a while')
      return
    }
    if (!problemsDifficultyMap[problemURL]) {
      alert('Difficulty not loaded yet, try again...')
      return
    }

    const socketId = socket.current.id
    if (!socketId) {
      alert('Socket not ready yet, try again...')
      return
    }

    const dateTime = new Date()
    updateResponseLoading(true)
    socket.current.emit('codeRequestQueue', {
      language: currentLanguage,
      code: snippets[problemURL][currentLanguage].code,
      socketId: socketId,
      problemTitle: problemURL,
      runnerType: 'submit',
      submissionTime: dateTime,
      // @ts-expect-error: userId is provided at runtime during sign-in
      userId: session.data.user.id,
      problemURL: problemURL,
      difficulty: problemsDifficultyMap[problemURL],
      topics: topics,
    })
  }

  return (
    <div className="flex gap-0.5 items-center justify-center">
      <div className="flex items-center justify-center gap-2 px-3 bg-[#222222] hover:bg-[#2b2b2b] p-2 rounded-l-lg hover:cursor-pointer">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"#a7a7a7"} fill={"#a7a7a7"}>
            <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <button onClick={handleRun} className="font-semibold text-lg">
          Run
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 px-3 bg-[#222222] hover:bg-[#2b2b2b] p-2 rounded-r-lg hover:cursor-pointer">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"#28c244"} fill={"none"}>
            <path d="M22 16C21.4102 15.3932 19.8403 13 19 13C18.1597 13 16.5898 15.3932 16 16M19 14L19 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.0035 21H12.0027C7.28739 21 4.92973 21 3.46487 19.5355C2 18.0711 2 15.714 2 11V7.94427C2 6.1278 2 5.21956 2.38042 4.53806C2.6516 4.05227 3.05255 3.65142 3.53848 3.38032C4.22017 3 5.12865 3 6.94562 3C8.10968 3 8.69172 3 9.20122 3.19101C10.3645 3.62712 10.8442 4.68358 11.3691 5.73313L12.0027 7M8.00163 7H16.754C18.8613 7 19.9149 7 20.6718 7.50559C20.9995 7.72447 21.2808 8.00572 21.4997 8.33329C21.8937 8.92282 21.9808 9.69244 22 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <button onClick={handleSubmit} className="text-[#28c244] text-lg">Submit</button>
      </div>
    </div>
  )
}

export default RunButton