'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SucessoPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto redirect to home after 5 seconds
    const timer = setTimeout(() => {
      router.push('/')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
        {/* Success icon */}
        <div className="mb-8">
          <svg
            className="w-32 h-32 mx-auto text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
          Voto Registado com Sucesso!
        </h1>

        <p className="text-2xl text-gray-600 mb-8">
          Obrigado pela sua participação.
        </p>

        <p className="text-xl text-gray-500">
          A regressar ao início em alguns segundos...
        </p>

        <button
          onClick={() => router.push('/')}
          className="btn-primary mt-8"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  )
}
