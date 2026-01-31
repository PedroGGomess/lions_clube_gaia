import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/crypto'

export async function POST(request: NextRequest) {
  try {
    const { token, candidateId } = await request.json()

    if (!token || !candidateId) {
      return NextResponse.json(
        { error: 'Token e candidato são obrigatórios' },
        { status: 400 }
      )
    }

    // Hash the token for storage
    const tokenHash = hashToken(token)

    // Check if this token was already used to vote
    const existingVote = await prisma.vote.findUnique({
      where: { tokenHash },
    })

    if (existingVote) {
      return NextResponse.json(
        { error: 'Este token já foi utilizado para votar' },
        { status: 400 }
      )
    }

    // Get candidate to verify it exists and get election ID
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { election: true },
    })

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      )
    }

    if (!candidate.election.isActive) {
      return NextResponse.json(
        { error: 'A eleição não está ativa' },
        { status: 400 }
      )
    }

    // Record the vote (anonymously - only the hashed token is stored)
    await prisma.vote.create({
      data: {
        tokenHash,
        candidateId,
        electionId: candidate.electionId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Voto registado com sucesso',
    })
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Erro ao registar voto' },
      { status: 500 }
    )
  }
}
