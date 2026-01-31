import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Get election
    const { data: election, error: electionError } = await supabase
      .from('elections')
      .select('*')
      .eq('id', id)
      .single()

    if (electionError || !election) {
      return NextResponse.json(
        { error: 'Eleição não encontrada' },
        { status: 404 }
      )
    }

    // Get choices
    const { data: choices, error: choicesError } = await supabase
      .from('choices')
      .select('*')
      .eq('election_id', id)
      .order('order_index', { ascending: true })

    if (choicesError) {
      return NextResponse.json(
        { error: 'Erro ao carregar opções' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      election,
      choices: choices || [],
    })
  } catch (error) {
    console.error('Error fetching election:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar eleição' },
      { status: 500 }
    )
  }
}
