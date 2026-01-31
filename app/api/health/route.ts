import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Health check endpoint to verify Supabase connection and database setup
 * Access at: /api/health
 * 
 * This endpoint checks:
 * 1. Supabase client configuration
 * 2. Database connectivity
 * 3. Required tables existence
 */
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      supabaseConfig: false,
      databaseConnection: false,
      requiredTables: {
        elections: false,
        choices: false,
        tokens: false,
        votes: false,
        admins: false,
      },
    },
    errors: [] as string[],
  }

  try {
    // Check 1: Supabase client is configured
    if (!supabase) {
      health.errors.push('Supabase client not initialized')
      health.status = 'unhealthy'
      return NextResponse.json(health, { status: 500 })
    }
    health.checks.supabaseConfig = true

    // Check 2: Can connect to database
    const { error: connectionError } = await supabase
      .from('elections')
      .select('count', { count: 'exact', head: true })

    if (connectionError) {
      // Check if it's a table not found error (common issue)
      if (connectionError.code === 'PGRST204' || connectionError.code === 'PGRST205') {
        health.errors.push(`Table 'elections' not found. Please run database/schema.sql in Supabase SQL Editor.`)
        health.errors.push(`Error: ${connectionError.message}`)
      } else {
        health.errors.push(`Database connection error: ${connectionError.message}`)
      }
      health.status = 'unhealthy'
    } else {
      health.checks.databaseConnection = true
    }

    // Check 3: Verify each required table exists
    const tables = ['elections', 'choices', 'tokens', 'votes', 'admins']
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true })

      if (!error) {
        health.checks.requiredTables[table as keyof typeof health.checks.requiredTables] = true
      } else {
        health.errors.push(`Table '${table}' is missing or inaccessible: ${error.message}`)
        health.status = 'unhealthy'
      }
    }

    // Overall status
    const allTablesExist = Object.values(health.checks.requiredTables).every(exists => exists)
    if (!allTablesExist) {
      health.errors.push('Some required tables are missing. Run database/schema.sql in Supabase SQL Editor.')
    }

    // Return appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : 500
    return NextResponse.json(health, { status: statusCode })

  } catch (error) {
    health.status = 'unhealthy'
    health.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return NextResponse.json(health, { status: 500 })
  }
}
