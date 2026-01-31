'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Candidate {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  order: number
}

export default function CandidatosPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem('votingToken')
    const electionId = sessionStorage.getItem('electionId')
    
    if (!token || !electionId) {
      router.push('/votar')
      return
    }

    fetchCandidates(electionId)
  }, [router])

  const fetchCandidates = async (electionId: string) => {
    try {
      const response = await fetch(`/api/votar/candidatos?electionId=${electionId}`)
      const data = await response.json()
      
      if (response.ok) {
        setCandidates(data.candidates)
      } else {
        setError('Erro ao carregar candidatos')
      }
    } catch (err) {
      setError('Erro ao carregar candidatos')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!selectedCandidate) return

    const token = sessionStorage.getItem('votingToken')
    if (!token) {
      router.push('/votar')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/votar/submeter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          candidateId: selectedCandidate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        sessionStorage.removeItem('votingToken')
        sessionStorage.removeItem('electionId')
        router.push('/votar/confirmacao')
      } else {
        setError(data.error || 'Erro ao registar voto')
      }
    } catch (err) {
      setError('Erro ao registar voto. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-2xl text-blue-900">A carregar...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 text-center">
            Selecione o seu candidato
          </h1>
          
          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl text-center mb-6">
              <p className="font-semibold text-lg">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate.id)}
                className={`w-full p-6 rounded-2xl border-4 transition-all text-left ${
                  selectedCandidate === candidate.id
                    ? 'border-blue-600 bg-blue-50 shadow-xl scale-105'
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-4">
                  {selectedCandidate === candidate.id && (
                    <div className="text-4xl">✓</div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {candidate.name}
                    </h3>
                    {candidate.description && (
                      <p className="text-lg text-gray-600">
                        {candidate.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <button
              onClick={handleVote}
              disabled={!selectedCandidate || submitting}
              className="w-full touch-button-large bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'A registar voto...' : 'Confirmar Voto ✓'}
            </button>

            <button
              onClick={() => router.push('/')}
              disabled={submitting}
              className="w-full touch-button bg-gray-300 hover:bg-gray-400 text-gray-800 disabled:bg-gray-400"
            >
              ← Cancelar
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
