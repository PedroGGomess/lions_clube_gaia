import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, hashPassword } from '@/lib/auth'
import crypto from 'crypto'

// Check if Supabase is configured
const useSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Import the appropriate database client
let dbClient: any = null
if (useSupabase) {
  const { supabase } = require('@/lib/supabase')
  dbClient = supabase
} else {
  const { prisma } = require('@/lib/prisma')
  dbClient = prisma
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Utilizador e palavra-passe são obrigatórios' },
        { status: 400 }
      )
    }

    let admin = null

    if (useSupabase) {
      // Use Supabase for production
      const { data: admins, error: fetchError } = await dbClient
        .from('admins')
        .select('*')
        .eq('username', username)
        .limit(1)

      if (fetchError) {
        console.error('Error fetching admin:', fetchError)
        return NextResponse.json(
          { error: 'Erro ao fazer login' },
          { status: 500 }
        )
      }

      admin = admins && admins.length > 0 ? admins[0] : null

      // If no admin exists, create the default admin (first time setup)
      if (!admin) {
        const { count: adminCount } = await dbClient
          .from('admins')
          .select('*', { count: 'exact', head: true })
        
        if (adminCount === 0) {
          // Create default admin
          const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'Lionsclubegaia@')
          const adminUsername = process.env.ADMIN_USERNAME || 'LionsClubeGaia'
          
          const { data: newAdmin, error: createError } = await dbClient
            .from('admins')
            .insert({
              username: adminUsername,
              password: hashedPassword,
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating admin:', createError)
            return NextResponse.json(
              { error: 'Erro ao criar administrador' },
              { status: 500 }
            )
          }

          admin = newAdmin
          
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
    } else {
      // Use Prisma for local development
      admin = await dbClient.admin.findUnique({
        where: { username },
      })

      // If no admin exists, create the default admin (first time setup)
      if (!admin) {
        const adminCount = await dbClient.admin.count()
        
        if (adminCount === 0) {
          // Create default admin
          const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'Lionsclubegaia@')
          const adminUsername = process.env.ADMIN_USERNAME || 'LionsClubeGaia'
          
          admin = await dbClient.admin.create({
            data: {
              username: adminUsername,
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
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
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
