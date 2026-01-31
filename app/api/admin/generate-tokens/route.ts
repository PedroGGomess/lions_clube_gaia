import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateTokens } from '@/lib/utils/token'
import { hashToken } from '@/lib/utils/hash'

export async function POST(request: NextRequest) {
  try {
    const { electionId, count } = await request.json()

    if (!electionId || !count || count < 1 || count > 1000) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Generate tokens
    const tokens = generateTokens(count, 8)

    // Hash tokens and prepare for database
    const tokenRecords = await Promise.all(
      tokens.map(async (token) => ({
        token_hash: await hashToken(token),
        election_id: electionId,
      }))
    )

    // Insert into database
    const { error } = await supabase
      .from('tokens')
      .insert(tokenRecords)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Erro ao gerar tokens' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tokens, // Return plain tokens only once for display/printing
      count: tokens.length,
    })
  } catch (error) {
    console.error('Error generating tokens:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar tokens' },
      { status: 500 }
    )
  }
}
