'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ConfirmacaoPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        <div className="text-center">
          <div className="text-8xl mb-6">✓</div>
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-4">
            Voto Registado!
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            O seu voto foi registado com sucesso.
          </p>
          <p className="text-xl text-gray-600 mb-8">
            Obrigado pela sua participação!
          </p>
          
          <div className="bg-green-100 border-2 border-green-400 rounded-xl p-6 mb-8">
            <p className="text-lg text-green-800">
              O seu voto é <strong>anónimo</strong> e <strong>seguro</strong>.
            </p>
          </div>

          <p className="text-gray-500 mb-6">
            A regressar ao início em {countdown} segundos...
          </p>

          <button
            onClick={() => router.push('/')}
            className="w-full touch-button-large bg-blue-600 hover:bg-blue-700 text-white"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    </main>
  )
}
