import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { electionId, status } = await request.json()

    if (!electionId || !status) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    if (!['draft', 'active', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }

    const { data: election, error } = await supabase
      .from('elections')
      .update({ status })
      .eq('id', electionId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao atualizar eleição' },
        { status: 500 }
      )
    }

    return NextResponse.json({ election })
  } catch (error) {
    console.error('Error updating election:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar eleição' },
      { status: 500 }
    )
  }
}
