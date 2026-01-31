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

    // Get total tokens issued
    const { count: tokensIssued } = await supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true })
      .eq('election_id', electionId)

    // Get total tokens used
    const { count: tokensUsed } = await supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true })
      .eq('election_id', electionId)
      .not('used_at', 'is', null)

    // Get total votes
    const { count: totalVotes } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('election_id', electionId)

    // Get votes by choice
    const { data: choices } = await supabase
      .from('choices')
      .select('id, label')
      .eq('election_id', electionId)

    const votesByChoice = await Promise.all(
      (choices || []).map(async (choice) => {
        const { count } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('choice_id', choice.id)

        return {
          label: choice.label,
          votes: count || 0,
        }
      })
    )

    return NextResponse.json({
      tokensIssued: tokensIssued || 0,
      tokensUsed: tokensUsed || 0,
      totalVotes: totalVotes || 0,
      votesByChoice,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar estatísticas' },
      { status: 500 }
    )
  }
}
