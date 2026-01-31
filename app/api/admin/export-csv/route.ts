import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const electionId = searchParams.get('electionId')

    if (!electionId) {
      return NextResponse.json(
        { error: 'ID da eleição não fornecido' },
        { status: 400 }
      )
    }

    // Get election info
    const { data: election } = await supabase
      .from('elections')
      .select('title')
      .eq('id', electionId)
      .single()

    // Get choices
    const { data: choices } = await supabase
      .from('choices')
      .select('id, label')
      .eq('election_id', electionId)

    // Get votes by choice
    const results = await Promise.all(
      (choices || []).map(async (choice) => {
        const { count } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('choice_id', choice.id)

        return {
          opcao: choice.label,
          votos: count || 0,
        }
      })
    )

    // Create CSV
    const headers = ['opcao', 'votos']
    const rows = [headers.join(',')]
    
    results.forEach(result => {
      rows.push(`"${result.opcao}",${result.votos}`)
    })

    const csv = rows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="resultados_${election?.title || 'eleicao'}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting CSV:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar CSV' },
      { status: 500 }
    )
  }
}
