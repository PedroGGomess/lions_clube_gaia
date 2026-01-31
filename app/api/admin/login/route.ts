import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, hashPassword } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Utilizador e palavra-passe são obrigatórios' },
        { status: 400 }
      )
    }

    // Try to find admin
    let admin = await prisma.admin.findUnique({
      where: { username },
    })

    // If no admin exists, create the default admin (first time setup)
    if (!admin) {
      const adminCount = await prisma.admin.count()
      
      if (adminCount === 0) {
        // Create default admin
        const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123')
        admin = await prisma.admin.create({
          data: {
            username: process.env.ADMIN_USERNAME || 'admin',
            password: hashedPassword,
          },
        })
        
        // Check if this matches the login attempt
        if (username !== admin.username) {
          return NextResponse.json(
            { error: 'Credenciais inválidas' },
            { status: 401 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Credenciais inválidas' },
          { status: 401 }
        )
      }
    }

    // Verify password
    const isValid = await verifyPassword(password, admin.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Generate a simple token (in production, use JWT)
    const token = crypto.randomBytes(32).toString('hex')

    return NextResponse.json({
      success: true,
      token,
      username: admin.username,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
