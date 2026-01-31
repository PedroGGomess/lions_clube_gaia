'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Election {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  isActive: boolean
  _count?: {
    candidates: number
    votingCodes: number
    votes: number
  }
}

export default function EleicoesPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/admin/login')
      return
    }
    fetchElections()
  }, [router])

  const fetchElections = async () => {
    try {
      const response = await fetch('/api/admin/eleicoes')
      if (response.ok) {
        const data = await response.json()
        setElections(data.elections)
      }
    } catch (error) {
      console.error('Error fetching elections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    router.push('/admin/login')
  }

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/admin/eleicoes/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState }),
      })
      
      if (response.ok) {
        fetchElections()
      }
    } catch (error) {
      console.error('Error toggling election:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">A carregar...</div>
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Eleições</h1>
            <div className="flex gap-4">
              <Link
                href="/admin/resultados"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📊 Resultados
              </Link>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ➕ Nova Eleição
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>

          {showCreateForm && (
            <CreateElectionForm
              onClose={() => setShowCreateForm(false)}
              onSuccess={() => {
                setShowCreateForm(false)
                fetchElections()
              }}
            />
          )}

          <div className="space-y-4">
            {elections.map((election) => (
              <div
                key={election.id}
                className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{election.title}</h3>
                    {election.description && (
                      <p className="text-gray-600">{election.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      election.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {election.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <p>Início: {new Date(election.startDate).toLocaleString('pt-PT')}</p>
                  <p>Fim: {new Date(election.endDate).toLocaleString('pt-PT')}</p>
                  {election._count && (
                    <p className="mt-2">
                      {election._count.candidates} candidatos • {election._count.votingCodes} códigos • {election._count.votes} votos
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(election.id, election.isActive)}
                    className={`px-4 py-2 rounded-lg text-white ${
                      election.isActive
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {election.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <Link
                    href={`/admin/codigos?electionId=${election.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Códigos
                  </Link>
                  <Link
                    href={`/admin/resultados?electionId=${election.id}`}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Resultados
                  </Link>
                </div>
              </div>
            ))}

            {elections.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Nenhuma eleição criada. Clique em "Nova Eleição" para começar.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function CreateElectionForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: ['', ''],
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/admin/eleicoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          candidates: formData.candidates.filter((c) => c.trim()),
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao criar eleição')
      }
    } catch (err) {
      setError('Erro ao criar eleição')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Nova Eleição</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Fim *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidatos *
            </label>
            {formData.candidates.map((candidate, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={candidate}
                  onChange={(e) => {
                    const newCandidates = [...formData.candidates]
                    newCandidates[index] = e.target.value
                    setFormData({ ...formData, candidates: newCandidates })
                  }}
                  placeholder={`Candidato ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                {formData.candidates.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newCandidates = formData.candidates.filter((_, i) => i !== index)
                      setFormData({ ...formData, candidates: newCandidates })
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, candidates: [...formData.candidates, ''] })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ➕ Adicionar Candidato
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'A criar...' : 'Criar Eleição'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
