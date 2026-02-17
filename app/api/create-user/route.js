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

    // Create Supabase client with service role (bypasses RLS and can create users)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, name, role, requestId } = await request.json()

    // Validate input
    if (!email || !role || !requestId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUsers.users.some(u => u.email === email)

    if (userExists) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Generate a random temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase() + '!1'

    // Create the user account
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      throw createError
    }

    // Update profile with role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: role,
        email: email
      })
      .eq('id', newUser.user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      // Don't fail - profile might auto-create via trigger
    }

    // Update access request status
    const { error: updateError } = await supabaseAdmin
      .from('access_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        notes: `Account created as ${role}`
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating request:', updateError)
    }

    // Send password reset email so user can set their own password
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`
      }
    })

    if (resetError) {
      console.error('Error sending reset email:', resetError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      userId: newUser.user.id,
      email: email
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}