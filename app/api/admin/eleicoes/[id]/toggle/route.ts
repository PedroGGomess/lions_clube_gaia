import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isActive } = await request.json()
    const { id } = await params

    const election = await prisma.election.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json({ election })
  } catch (error) {
    console.error('Error toggling election:', error)
    return NextResponse.json(
      { error: 'Erro ao alterar estado da eleição' },
      { status: 500 }
    )
  }
}
