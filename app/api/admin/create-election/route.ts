import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    const { data: election, error } = await supabase
      .from('elections')
      .insert({
        title,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao criar eleição' },
        { status: 500 }
      )
    }

    return NextResponse.json({ election })
  } catch (error) {
    console.error('Error creating election:', error)
    return NextResponse.json(
      { error: 'Erro ao criar eleição' },
      { status: 500 }
    )
  }
}
