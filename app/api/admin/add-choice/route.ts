import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { electionId, label, orderIndex } = await request.json()

    if (!electionId || !label) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const { data: choice, error } = await supabase
      .from('choices')
      .insert({
        election_id: electionId,
        label,
        order_index: orderIndex ?? 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao adicionar opção' },
        { status: 500 }
      )
    }

    return NextResponse.json({ choice })
  } catch (error) {
    console.error('Error adding choice:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar opção' },
      { status: 500 }
    )
  }
}
