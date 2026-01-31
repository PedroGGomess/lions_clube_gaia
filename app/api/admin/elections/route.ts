import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: elections, error } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao carregar eleições' },
        { status: 500 }
      )
    }

    return NextResponse.json({ elections: elections || [] })
  } catch (error) {
    console.error('Error fetching elections:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar eleições' },
      { status: 500 }
    )
  }
}
