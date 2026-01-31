'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim().toUpperCase() }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        // Store token in session storage for voting
        sessionStorage.setItem('votingToken', token.trim().toUpperCase())
        sessionStorage.setItem('electionId', data.electionId)
        router.push('/votar')
      } else {
        setError(data.message || 'Token inválido ou já utilizado')
      }
    } catch (err) {
      setError('Erro ao validar token. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Votação Eletrónica
          </h1>
          <p className="text-xl text-gray-600">
            Insira o seu código de acesso para votar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-2xl font-medium text-gray-700 mb-3">
              Código de Acesso
            </label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              className="input-large text-center tracking-widest uppercase"
              placeholder="XXXXXXXX"
              maxLength={8}
              required
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg text-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || token.length < 4}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'A validar...' : 'Continuar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            Em caso de dúvidas, contacte um membro da organização
          </p>
        </div>
      </div>
    </div>
  )
}
