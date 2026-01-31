'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VotarPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/votar/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store token in sessionStorage for security
        sessionStorage.setItem('votingToken', data.token)
        sessionStorage.setItem('electionId', data.electionId)
        router.push('/votar/candidatos')
      } else {
        setError(data.error || 'Código inválido')
      }
    } catch (err) {
      setError('Erro ao validar código. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Votação Eletrónica
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Introduza o seu código de votação
          </p>
          <p className="text-sm text-gray-500">
            O código foi-lhe fornecido na entrada do evento
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO"
              className="w-full text-3xl text-center font-mono font-bold p-6 border-4 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none uppercase"
              maxLength={8}
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl text-center">
              <p className="font-semibold text-lg">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 8}
            className="w-full touch-button-large bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'A validar...' : 'Continuar ➜'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full touch-button bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            ← Voltar
          </button>
        </form>
      </div>
    </main>
  )
}
