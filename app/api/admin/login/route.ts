import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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

    // Try to find admin in Supabase
    const { data: admins, error: fetchError } = await supabase
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

    let admin = admins && admins.length > 0 ? admins[0] : null

    // If no admin exists, create the default admin (first time setup)
    if (!admin) {
      const { count: adminCount } = await supabase
        .from('admins')
        .select('*', { count: 'exact', head: true })
      
      if (adminCount === 0) {
        // Create default admin
        const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123')
        const adminUsername = process.env.ADMIN_USERNAME || 'admin'
        
        const { data: newAdmin, error: createError } = await supabase
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
