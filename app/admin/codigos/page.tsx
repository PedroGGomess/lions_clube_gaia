'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface VotingCode {
  id: string
  code: string
  used: boolean
  usedAt: string | null
  createdAt: string
}

function CodigosContent() {
  const [codes, setCodes] = useState<VotingCode[]>([])
  const [election, setElection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [quantity, setQuantity] = useState(10)
  const router = useRouter()
  const searchParams = useSearchParams()
  const electionId = searchParams.get('electionId')

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/admin/login')
      return
    }
    if (!electionId) {
      router.push('/admin/eleicoes')
      return
    }
    fetchCodes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId, router])

  const fetchCodes = async () => {
    if (!electionId) return

    try {
      const response = await fetch(`/api/admin/codigos?electionId=${electionId}`)
      if (response.ok) {
        const data = await response.json()
        setCodes(data.codes)
        setElection(data.election)
      }
    } catch (error) {
      console.error('Error fetching codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCodes = async () => {
    if (!electionId || quantity < 1) return

    setGenerating(true)
    try {
      const response = await fetch('/api/admin/codigos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ electionId, quantity }),
      })

      if (response.ok) {
        fetchCodes()
      }
    } catch (error) {
      console.error('Error generating codes:', error)
    } finally {
      setGenerating(false)
    }
  }

  const downloadCodes = () => {
    const csv = [
      'Código,Utilizado,Data de Utilização',
      ...codes.map((code) => 
        `${code.code},${code.used ? 'Sim' : 'Não'},${code.usedAt ? new Date(code.usedAt).toLocaleString('pt-PT') : ''}`
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `codigos-${election?.title || 'eleicao'}.csv`
    a.click()
  }

  const printCodes = () => {
    const unusedCodes = codes.filter(c => !c.used)
    const printWindow = window.open('', '', 'height=600,width=800')
    
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Códigos de Votação - ${election?.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; margin-bottom: 30px; }
            .code-grid { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 15px; 
            }
            .code-card {
              border: 2px dashed #333;
              padding: 15px;
              text-align: center;
              page-break-inside: avoid;
            }
            .code {
              font-size: 24px;
              font-weight: bold;
              font-family: monospace;
              letter-spacing: 2px;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="no-print" onclick="window.print()" style="padding: 10px 20px; margin-bottom: 20px; cursor: pointer;">
            Imprimir
          </button>
          <h1>${election?.title}</h1>
          <div class="code-grid">
            ${unusedCodes.map(code => `
              <div class="code-card">
                <div>Código de Votação</div>
                <div class="code">${code.code}</div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">A carregar...</div>
  }

  const usedCount = codes.filter(c => c.used).length
  const unusedCount = codes.filter(c => !c.used).length

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Códigos de Votação</h1>
              {election && (
                <p className="text-gray-600 mt-1">{election.title}</p>
              )}
            </div>
            <Link
              href="/admin/eleicoes"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Voltar
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-sm text-blue-800 font-medium">Total</div>
              <div className="text-3xl font-bold text-blue-900">{codes.length}</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-sm text-green-800 font-medium">Não Utilizados</div>
              <div className="text-3xl font-bold text-green-900">{unusedCount}</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-sm text-gray-800 font-medium">Utilizados</div>
              <div className="text-3xl font-bold text-gray-900">{usedCount}</div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              min="1"
              max="1000"
              className="px-4 py-2 border border-gray-300 rounded-lg w-32"
            />
            <button
              onClick={generateCodes}
              disabled={generating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {generating ? 'A gerar...' : '➕ Gerar Códigos'}
            </button>
            <button
              onClick={downloadCodes}
              disabled={codes.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              📥 Exportar CSV
            </button>
            <button
              onClick={printCodes}
              disabled={unusedCount === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              🖨️ Imprimir Não Utilizados
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Código</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Data de Utilização</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code.id} className="border-b">
                    <td className="px-4 py-3 font-mono font-bold text-lg">{code.code}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          code.used
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {code.used ? 'Utilizado' : 'Disponível'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {code.usedAt
                        ? new Date(code.usedAt).toLocaleString('pt-PT')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {codes.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Nenhum código gerado. Clique em "Gerar Códigos" para começar.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CodigosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">A carregar...</div>}>
      <CodigosContent />
    </Suspense>
  )
}
