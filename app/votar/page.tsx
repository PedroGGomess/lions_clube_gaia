'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Choice {
  id: string
  label: string
  order_index: number
}

export default function VotarPage() {
  const [choices, setChoices] = useState<Choice[]>([])
  const [selectedChoice, setSelectedChoice] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [electionTitle, setElectionTitle] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem('votingToken')
    const electionId = sessionStorage.getItem('electionId')

    if (!token || !electionId) {
      router.push('/')
      return
    }

    // Fetch election details and choices
    fetchElectionData(electionId)
  }, [router])

  const fetchElectionData = async (electionId: string) => {
    try {
      const response = await fetch(`/api/election/${electionId}`)
      const data = await response.json()

      if (response.ok) {
        setElectionTitle(data.election.title)
        setChoices(data.choices.sort((a: Choice, b: Choice) => a.order_index - b.order_index))
      } else {
        setError('Erro ao carregar opções de voto')
      }
    } catch (err) {
      setError('Erro ao carregar dados da eleição')
    } finally {
      setLoading(false)
    }
  }

  const handleVoteClick = (choiceId: string) => {
    setSelectedChoice(choiceId)
    setShowConfirmation(true)
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    setError('')

    const token = sessionStorage.getItem('votingToken')
    const electionId = sessionStorage.getItem('electionId')

    try {
      const response = await fetch('/api/submit-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          electionId,
          choiceId: selectedChoice,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Clear session storage
        sessionStorage.removeItem('votingToken')
        sessionStorage.removeItem('electionId')
        router.push('/sucesso')
      } else {
        setError(data.message || 'Erro ao registar voto')
        setShowConfirmation(false)
      }
    } catch (err) {
      setError('Erro ao enviar voto. Tente novamente.')
      setShowConfirmation(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    setSelectedChoice('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-3xl text-gray-700">A carregar...</div>
      </div>
    )
  }

  if (showConfirmation) {
    const selectedChoiceData = choices.find(c => c.id === selectedChoice)
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Confirmar Voto
          </h1>
          
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-8 mb-8">
            <p className="text-2xl text-gray-700 mb-4 text-center">
              Tem a certeza que deseja votar em:
            </p>
            <p className="text-4xl font-bold text-blue-600 text-center">
              {selectedChoiceData?.label}
            </p>
          </div>

          <p className="text-xl text-gray-600 mb-8 text-center">
            Esta ação não pode ser revertida.
          </p>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg text-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCancel}
              disabled={submitting}
              className="btn-secondary disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="btn-success disabled:opacity-50"
            >
              {submitting ? 'A enviar...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 text-center">
            {electionTitle || 'Votação'}
          </h1>
          
          <p className="text-2xl text-gray-600 mb-8 text-center">
            Selecione a sua opção de voto
          </p>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg text-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleVoteClick(choice.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-8 px-8 rounded-lg text-3xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {choice.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
