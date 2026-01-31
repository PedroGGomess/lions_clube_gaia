import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCode, hashToken } from '@/lib/crypto'

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
      select: { id: true, title: true },
    })

    const codes = await prisma.votingCode.findMany({
      where: { electionId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        used: true,
        usedAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ election, codes })
  } catch (error) {
    console.error('Error fetching codes:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar códigos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { electionId, quantity } = await request.json()

    if (!electionId || !quantity || quantity < 1 || quantity > 1000) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Generate unique codes
    const codes: Array<{ code: string; tokenHash: string }> = []
    const existingCodes = new Set(
      (await prisma.votingCode.findMany({
        where: { electionId },
        select: { code: true },
      })).map(c => c.code)
    )

    while (codes.length < quantity) {
      const code = generateCode()
      if (!existingCodes.has(code) && !codes.find(c => c.code === code)) {
        const tokenHash = hashToken(code)
        codes.push({ code, tokenHash })
      }
    }

    // Create codes in database
    await prisma.votingCode.createMany({
      data: codes.map(({ code, tokenHash }) => ({
        code,
        tokenHash,
        electionId,
      })),
    })

    return NextResponse.json({
      success: true,
      generated: codes.length,
    })
  } catch (error) {
    console.error('Error generating codes:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar códigos' },
      { status: 500 }
    )
  }
}
