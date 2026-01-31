import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const elections = await prisma.election.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            candidates: true,
            votingCodes: true,
            votes: true,
          },
        },
      },
    })

    return NextResponse.json({ elections })
  } catch (error) {
    console.error('Error fetching elections:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar eleições' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, startDate, endDate, candidates } = await request.json()

    if (!title || !startDate || !endDate || !candidates || candidates.length < 2) {
      return NextResponse.json(
        { error: 'Dados incompletos. São necessários título, datas e pelo menos 2 candidatos.' },
        { status: 400 }
      )
    }

    // Create election with candidates
    const election = await prisma.election.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        candidates: {
          create: candidates.map((name: string, index: number) => ({
            name,
            order: index,
          })),
        },
      },
      include: {
        candidates: true,
      },
    })

    return NextResponse.json({ election })
  } catch (error) {
    console.error('Error creating election:', error)
    return NextResponse.json(
      { error: 'Erro ao criar eleição' },
      { status: 500 }
    )
  }
}
