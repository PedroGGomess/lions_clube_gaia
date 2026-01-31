import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVotingToken, hashToken } from '@/lib/crypto'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      )
    }

    // Find the voting code
    const votingCode = await prisma.votingCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { election: true },
    })

    if (!votingCode) {
      return NextResponse.json(
        { error: 'Código não encontrado' },
        { status: 404 }
      )
    }

    if (votingCode.used) {
      return NextResponse.json(
        { error: 'Este código já foi utilizado' },
        { status: 400 }
      )
    }

    if (!votingCode.election.isActive) {
      return NextResponse.json(
        { error: 'A eleição não está ativa' },
        { status: 400 }
      )
    }

    // Check if election is within date range
    const now = new Date()
    if (now < votingCode.election.startDate || now > votingCode.election.endDate) {
      return NextResponse.json(
        { error: 'A eleição não está disponível' },
        { status: 400 }
      )
    }

    // Generate a voting token (this is what the user will use to cast the vote)
    // The token is different from the code and will be hashed when storing the vote
    const token = generateVotingToken(code)

    // Mark the code as used
    await prisma.votingCode.update({
      where: { id: votingCode.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      token,
      electionId: votingCode.electionId,
      electionTitle: votingCode.election.title,
    })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Erro ao validar código' },
      { status: 500 }
    )
  }
}
