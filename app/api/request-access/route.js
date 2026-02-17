import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Check if environment variables exist
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact admin.' },
        { status: 500 }
      )
    }

    // Use service role key for bypassing RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const body = await request.json()
    
    // Validate input
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert into database (bypasses RLS with service role)
    const { data, error } = await supabase
      .from('access_requests')
      .insert([{
        name: body.name,
        email: body.email,
        message: body.message,
        favorite_book: body.favorite_book || null,
        status: 'pending'
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}