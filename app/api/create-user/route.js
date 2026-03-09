import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

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

    if (!process.env.RESEND_API_KEY) {
      console.error('Missing Resend API key')
      return NextResponse.json(
        { error: 'Email service not configured.' },
        { status: 500 }
      )
    }

    // Create Supabase client with service role
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
      email_confirm: true,
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

    // Generate password reset link
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tfsbookclub.com'}/reset-password`
      }
    })

    if (resetError) {
      console.error('Error generating reset link:', resetError)
      throw new Error('Failed to generate password reset link')
    }

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'TFS Book Club <noreply@tfsbookclub.com>',
      to: [email],
      subject: 'Welcome to TFS Book Club! Set Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e11d48;">Welcome to TFS Book Club!</h2>
          
          <p>Hi ${name},</p>
          
          <p>Your account has been approved! Click the button below to set your password and get started:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetData.properties.action_link}" 
               style="background-color: #e11d48; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Set Your Password
            </a>
          </div>
          
          <p>Once you've set your password, you can:</p>
          <ul>
            <li>Browse our book catalog</li>
            <li>Track your reading progress</li>
            <li>Write reviews</li>
            <li>Participate in polls</li>
            <li>Join community discussions</li>
          </ul>
          
          <p style="margin-top: 30px;">Happy reading! 📚</p>
          
          <p>- The TFS Book Club Team</p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 12px; color: #6b7280;">
            If you didn't request this account, you can safely ignore this email.
          </p>
        </div>
      `
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail the whole process if email fails
      // Account is still created
    } else {
      console.log('✅ Email sent successfully via Resend:', emailData)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      userId: newUser.user.id,
      email: email,
      emailSent: !emailError
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}