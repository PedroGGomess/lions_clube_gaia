import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashToken } from '@/lib/utils/hash'
import { rateLimit } from '@/lib/utils/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const limit = rateLimit(ip, 10, 60000)
    
    if (!limit.allowed) {
      return NextResponse.json(
        { valid: false, message: 'Muitas tentativas. Tente novamente mais tarde.' },
        { status: 429 }
      )
    }

    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Token inválido' },
        { status: 400 }
      )
    }

    // Hash the token
    const tokenHash = await hashToken(token)

    // Find the token in database
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('id, election_id, used_at')
      .eq('token_hash', tokenHash)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { valid: false, message: 'Token não encontrado' },
        { status: 404 }
      )
    }

    // Check if token was already used
    if (tokenData.used_at) {
      return NextResponse.json(
        { valid: false, message: 'Token já foi utilizado' },
        { status: 400 }
      )
    }

    // Check if election is active
    const { data: election, error: electionError } = await supabase
      .from('elections')
      .select('id, status')
      .eq('id', tokenData.election_id)
      .single()

    if (electionError || !election || election.status !== 'active') {
      return NextResponse.json(
        { valid: false, message: 'Eleição não está ativa' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      electionId: tokenData.election_id,
    })
  } catch (error) {
    console.error('Error validating token:', error)
    return NextResponse.json(
      { valid: false, message: 'Erro ao validar token' },
      { status: 500 }
    )
  }
}
