import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashToken } from '@/lib/utils/hash'

export async function POST(request: NextRequest) {
  try {
    const { token, electionId, choiceId } = await request.json()

    if (!token || !electionId || !choiceId) {
      return NextResponse.json(
        { success: false, message: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Hash the token
    const tokenHash = await hashToken(token)

    // Start transaction-like operations
    // 1. Find and verify token
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('id, election_id, used_at')
      .eq('token_hash', tokenHash)
      .eq('election_id', electionId)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 400 }
      )
    }

    if (tokenData.used_at) {
      return NextResponse.json(
        { success: false, message: 'Token já foi utilizado' },
        { status: 400 }
      )
    }

    // 2. Verify choice belongs to election
    const { data: choice, error: choiceError } = await supabase
      .from('choices')
      .select('id, election_id')
      .eq('id', choiceId)
      .eq('election_id', electionId)
      .single()

    if (choiceError || !choice) {
      return NextResponse.json(
        { success: false, message: 'Opção de voto inválida' },
        { status: 400 }
      )
    }

    // 3. Mark token as used (atomic operation)
    const { error: updateError } = await supabase
      .from('tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id)
      .is('used_at', null) // Only update if still null (prevents race condition)

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Erro ao processar voto' },
        { status: 500 }
      )
    }

    // 4. Insert anonymous vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        election_id: electionId,
        choice_id: choiceId,
      })

    if (voteError) {
      // Try to rollback token usage
      await supabase
        .from('tokens')
        .update({ used_at: null })
        .eq('id', tokenData.id)

      return NextResponse.json(
        { success: false, message: 'Erro ao registar voto' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Voto registado com sucesso',
    })
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao enviar voto' },
      { status: 500 }
    )
  }
}
