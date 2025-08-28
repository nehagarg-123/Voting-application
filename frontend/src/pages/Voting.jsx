import React, { useEffect, useState } from 'react'
import { fetchCandidates, voteCandidate } from '../services/api'
import { socket } from '../services/socket'

export default function Voting() {
  const [candidates, setCandidates] = useState([])
  const [loadingVoteId, setLoadingVoteId] = useState(null)
  const [votedCandidateId, setVotedCandidateId] = useState(null)

  const loadCandidates = async () => {
    try {
      const res = await fetchCandidates()
      setCandidates(res.data.candidates || res.data || [])
      setVotedCandidateId(res.data.votedCandidateId || null)
    } catch (err) {
      console.error('Load candidates error:', err)
    }
  }

  useEffect(() => {
    loadCandidates()

    // Socket updates for votes
    socket.on('voteUpdated', (updatedCandidates) => {
      if (Array.isArray(updatedCandidates)) {
        setCandidates(updatedCandidates)
      } else if (updatedCandidates && updatedCandidates.candidateId) {
        setCandidates(prev =>
          prev.map(c =>
            c._id === updatedCandidates.candidateId
              ? { ...c, voteCount: updatedCandidates.voteCount ?? c.voteCount }
              : c
          )
        )
      }
    })

    return () => {
      socket.off('voteUpdated')
    }
  }, [])

  const onVote = async (id) => {
    try {
      setLoadingVoteId(id)
      await voteCandidate(id)
      setVotedCandidateId(id)
      setLoadingVoteId(null)
    } catch (err) {
      setLoadingVoteId(null)
      console.error('Vote failed:', err)
      loadCandidates()
      alert(err?.response?.data?.message || 'Vote failed')
    }
  }

  return (
    <div className="relative w-screen min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-blue-200 to-blue-500"></div>
      <div className="relative pt-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-white">Vote</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {candidates.map((c) => (
            <div
              key={c._id}
              className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 flex flex-col items-center gap-3 text-gray-900
              ${votedCandidateId === c._id ? 'border-4 border-green-500' : ''}`}
            >
              <img
                src={c.photo || c.image || "/default.png"}
                alt={c.name}
                className="w-30 h-30 rounded-full object-cover border-4 border-purple-300 shadow"
              />
              <h3 className="font-semibold text-lg mt-2">{c.name}</h3>
              <p className="text-sm text-gray-600">{c.party || ""}</p>

              {votedCandidateId === c._id && (
                <p className="text-green-600 font-bold">✅ You voted for this candidate</p>
              )}

              {votedCandidateId ? (
                votedCandidateId !== c._id && <p className="text-gray-500">Voting disabled</p>
              ) : (
                <button
                  onClick={() => onVote(c._id)}
                  className="mt-2 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-60"
                  disabled={loadingVoteId === c._id}
                >
                  {loadingVoteId === c._id ? "Voting..." : "Vote"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
