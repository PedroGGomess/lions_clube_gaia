'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface CandidateResult {
  id: string
  name: string
  voteCount: number
  percentage: number
}

interface ElectionResult {
  id: string
  title: string
  description: string | null
  isActive: boolean
  totalVotes: number
  totalCodes: number
  usedCodes: number
  candidates: CandidateResult[]
}

function ResultadosContent() {
  const [result, setResult] = useState<ElectionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const electionId = searchParams.get('electionId')

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/admin/login')
      return
    }
    if (electionId) {
      fetchResults(electionId)
    } else {
      setLoading(false)
    }
  }, [electionId, router])

  const fetchResults = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/resultados?electionId=${id}`)
      if (response.ok) {
        const data = await response.json()
        setResult(data)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadResults = () => {
    if (!result) return

    const csv = [
      'Candidato,Votos,Percentagem',
      ...result.candidates.map((c) => 
        `${c.name},${c.voteCount},${c.percentage.toFixed(2)}%`
      ),
      '',
      `Total de Votos,${result.totalVotes}`,
      `Total de Códigos,${result.totalCodes}`,
      `Códigos Utilizados,${result.usedCodes}`,
      `Taxa de Participação,${result.totalCodes > 0 ? ((result.usedCodes / result.totalCodes) * 100).toFixed(2) : 0}%`,
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resultados-${result.title}.csv`
    a.click()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">A carregar...</div>
  }

  if (!electionId || !result) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Resultados</h1>
            <p className="text-gray-600 mb-6">
              Selecione uma eleição para ver os resultados.
            </p>
            <Link
              href="/admin/eleicoes"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ver Eleições
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const maxVotes = Math.max(...result.candidates.map(c => c.voteCount), 1)
  const participationRate = result.totalCodes > 0 
    ? ((result.usedCodes / result.totalCodes) * 100).toFixed(1)
    : '0'

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resultados</h1>
              <h2 className="text-xl text-gray-600 mt-1">{result.title}</h2>
              {result.description && (
                <p className="text-gray-500 mt-1">{result.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadResults}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📥 Exportar
              </button>
              <Link
                href="/admin/eleicoes"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                ← Voltar
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-sm text-blue-800 font-medium">Total de Votos</div>
              <div className="text-3xl font-bold text-blue-900">{result.totalVotes}</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-sm text-green-800 font-medium">Códigos Usados</div>
              <div className="text-3xl font-bold text-green-900">{result.usedCodes}</div>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <div className="text-sm text-purple-800 font-medium">Total de Códigos</div>
              <div className="text-3xl font-bold text-purple-900">{result.totalCodes}</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <div className="text-sm text-yellow-800 font-medium">Participação</div>
              <div className="text-3xl font-bold text-yellow-900">{participationRate}%</div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Candidatos</h3>
            
            {result.candidates.map((candidate, index) => (
              <div key={candidate.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <h4 className="text-2xl font-bold text-gray-900">
                      {candidate.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-900">
                      {candidate.voteCount}
                    </div>
                    <div className="text-sm text-gray-600">
                      {candidate.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div
                    className="bg-blue-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                    style={{ width: `${(candidate.voteCount / maxVotes) * 100}%` }}
                  >
                    {candidate.voteCount > 0 && (
                      <span className="text-white font-semibold text-sm">
                        {candidate.percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {result.candidates.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Nenhum candidato registado para esta eleição.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ResultadosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">A carregar...</div>}>
      <ResultadosContent />
    </Suspense>
  )
}
