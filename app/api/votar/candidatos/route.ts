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

    const candidates = await prisma.candidate.findMany({
      where: { electionId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        order: true,
      },
    })

    return NextResponse.json({ candidates })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar candidatos' },
      { status: 500 }
    )
  }
}
