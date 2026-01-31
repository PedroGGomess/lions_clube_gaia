import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Lions Clube Gaia
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-blue-700 mb-6">
            Sistema de Votação Eletrónica
          </h2>
          <p className="text-gray-600 text-lg">
            Selecione uma opção para continuar
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/votar"
            className="block w-full touch-button-large bg-blue-600 hover:bg-blue-700 text-white text-center"
          >
            🗳️ Votar
          </Link>
          
          <Link
            href="/admin"
            className="block w-full touch-button bg-gray-600 hover:bg-gray-700 text-white text-center"
          >
            ⚙️ Administração
          </Link>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Sistema seguro de votação anónima</p>
        </div>
      </div>
    </main>
  )
}
