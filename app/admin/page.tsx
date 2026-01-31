'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Election {
  id: string
  title: string
  status: string
  created_at: string
}

interface Choice {
  id: string
  label: string
  order_index: number
}

interface Stats {
  tokensIssued: number
  tokensUsed: number
  totalVotes: number
  votesByChoice: Array<{ label: string; votes: number }>
}

export default function AdminPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [selectedElection, setSelectedElection] = useState<string>('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tokens, setTokens] = useState<string[]>([])
  const [showTokens, setShowTokens] = useState(false)
  const router = useRouter()

  // Forms state
  const [newElectionTitle, setNewElectionTitle] = useState('')
  const [newChoiceLabel, setNewChoiceLabel] = useState('')
  const [choices, setChoices] = useState<Choice[]>([])
  const [tokenCount, setTokenCount] = useState(60)

  useEffect(() => {
    // Check admin auth
    const isAdmin = sessionStorage.getItem('adminAuth')
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    fetchElections()
  }, [router])

  useEffect(() => {
    if (selectedElection) {
      fetchStats()
      fetchChoices()
    }
  }, [selectedElection])

  const fetchElections = async () => {
    try {
      const response = await fetch('/api/admin/elections')
      const data = await response.json()
      if (response.ok) {
        setElections(data.elections)
        if (data.elections.length > 0 && !selectedElection) {
          setSelectedElection(data.elections[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching elections:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/stats?electionId=${selectedElection}`)
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const fetchChoices = async () => {
    try {
      const response = await fetch(`/api/election/${selectedElection}`)
      const data = await response.json()
      if (response.ok) {
        setChoices(data.choices)
      }
    } catch (err) {
      console.error('Error fetching choices:', err)
    }
  }

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/create-election', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newElectionTitle }),
      })
      const data = await response.json()
      if (response.ok) {
        setNewElectionTitle('')
        fetchElections()
        setSelectedElection(data.election.id)
      }
    } catch (err) {
      console.error('Error creating election:', err)
    }
  }

  const handleAddChoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedElection) return

    try {
      const response = await fetch('/api/admin/add-choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionId: selectedElection,
          label: newChoiceLabel,
          orderIndex: choices.length,
        }),
      })
      if (response.ok) {
        setNewChoiceLabel('')
        fetchChoices()
      }
    } catch (err) {
      console.error('Error adding choice:', err)
    }
  }

  const handleGenerateTokens = async () => {
    if (!selectedElection) return

    try {
      const response = await fetch('/api/admin/generate-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionId: selectedElection,
          count: tokenCount,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setTokens(data.tokens)
        setShowTokens(true)
        fetchStats()
      }
    } catch (err) {
      console.error('Error generating tokens:', err)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!selectedElection) return

    try {
      const response = await fetch('/api/admin/update-election', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionId: selectedElection,
          status,
        }),
      })
      if (response.ok) {
        fetchElections()
      }
    } catch (err) {
      console.error('Error updating election:', err)
    }
  }

  const handleExportCSV = async () => {
    if (!selectedElection) return

    try {
      const response = await fetch(`/api/admin/export-csv?electionId=${selectedElection}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resultados_${selectedElection}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exporting CSV:', err)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    router.push('/admin/login')
  }

  const currentElection = elections.find(e => e.id === selectedElection)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">A carregar...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Painel de Administração</h1>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded">
            Sair
          </button>
        </div>

        {/* Create Election */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Criar Nova Eleição</h2>
          <form onSubmit={handleCreateElection} className="flex gap-4">
            <input
              type="text"
              value={newElectionTitle}
              onChange={(e) => setNewElectionTitle(e.target.value)}
              placeholder="Título da eleição"
              className="border rounded px-4 py-2 flex-1"
              required
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
              Criar
            </button>
          </form>
        </div>

        {/* Election Selector */}
        {elections.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Eleição Selecionada</h2>
            <select
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              className="border rounded px-4 py-2 w-full mb-4"
            >
              {elections.map(election => (
                <option key={election.id} value={election.id}>
                  {election.title} ({election.status})
                </option>
              ))}
            </select>

            {currentElection && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus('active')}
                  disabled={currentElection.status === 'active'}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Ativar
                </button>
                <button
                  onClick={() => handleUpdateStatus('closed')}
                  disabled={currentElection.status === 'closed'}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        )}

        {selectedElection && (
          <>
            {/* Add Choices */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Opções de Voto</h2>
              
              {choices.length > 0 && (
                <div className="mb-4">
                  <ul className="space-y-2">
                    {choices.sort((a, b) => a.order_index - b.order_index).map((choice, index) => (
                      <li key={choice.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="font-bold">{index + 1}.</span>
                        <span>{choice.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleAddChoice} className="flex gap-4">
                <input
                  type="text"
                  value={newChoiceLabel}
                  onChange={(e) => setNewChoiceLabel(e.target.value)}
                  placeholder="Nova opção"
                  className="border rounded px-4 py-2 flex-1"
                  required
                />
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
                  Adicionar
                </button>
              </form>
            </div>

            {/* Generate Tokens */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Gerar Tokens</h2>
              <div className="flex gap-4 items-center mb-4">
                <input
                  type="number"
                  value={tokenCount}
                  onChange={(e) => setTokenCount(parseInt(e.target.value))}
                  min="1"
                  max="1000"
                  className="border rounded px-4 py-2 w-32"
                />
                <button
                  onClick={handleGenerateTokens}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded"
                >
                  Gerar Tokens
                </button>
              </div>

              {showTokens && tokens.length > 0 && (
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-bold mb-2">Tokens Gerados (guarde estes códigos!):</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                    {tokens.map((token, index) => (
                      <div key={index} className="bg-white p-2 rounded text-center font-mono border">
                        {token}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const text = tokens.join('\n')
                      navigator.clipboard.writeText(text)
                      alert('Tokens copiados!')
                    }}
                    className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Copiar Todos
                  </button>
                </div>
              )}
            </div>

            {/* Statistics */}
            {stats && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Estatísticas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="text-gray-600">Tokens Emitidos</div>
                    <div className="text-3xl font-bold">{stats.tokensIssued}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <div className="text-gray-600">Tokens Utilizados</div>
                    <div className="text-3xl font-bold">{stats.tokensUsed}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <div className="text-gray-600">Total de Votos</div>
                    <div className="text-3xl font-bold">{stats.totalVotes}</div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">Resultados</h3>
                <div className="space-y-2">
                  {stats.votesByChoice.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-100 rounded p-3">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.votes} votos</div>
                      </div>
                      <div className="text-2xl font-bold w-16 text-right">{item.votes}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleExportCSV}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
                >
                  Exportar CSV
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
