import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const electionId = searchParams.get('electionId')

    if (!electionId) {
      return NextResponse.json(
        { error: 'ID da eleição é obrigatório' },
        { status: 400 }
      )
    }

    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        candidates: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            votes: true,
            votingCodes: true,
          },
        },
      },
    })

    if (!election) {
      return NextResponse.json(
        { error: 'Eleição não encontrada' },
        { status: 404 }
      )
    }

    const totalVotes = election._count.votes
    const totalCodes = election._count.votingCodes

    const usedCodes = await prisma.votingCode.count({
      where: {
        electionId,
        used: true,
      },
    })

    const candidates = election.candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      voteCount: candidate._count.votes,
      percentage: totalVotes > 0 ? (candidate._count.votes / totalVotes) * 100 : 0,
    }))

    // Sort by vote count descending
    candidates.sort((a, b) => b.voteCount - a.voteCount)

    return NextResponse.json({
      id: election.id,
      title: election.title,
      description: election.description,
      isActive: election.isActive,
      totalVotes,
      totalCodes,
      usedCodes,
      candidates,
    })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar resultados' },
      { status: 500 }
    )
  }
}
