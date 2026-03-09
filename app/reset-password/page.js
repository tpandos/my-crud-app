'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState(false)

  useEffect(() => {
    // Check if we have a valid session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidToken(true)
      } else {
        setError('Invalid or expired reset link. Please request a new one.')
      }
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      setSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">
            Password Set Successfully!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Redirecting you to your dashboard...
          </p>
          
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          </div>
        </div>
      </div>
    )
  }

  // Invalid token screen
  if (!validToken && error) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">
            Invalid Reset Link
          </h2>
          
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          <Link
            href="/login"
            className="inline-block bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // Password reset form
  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
            Set Your Password
          </h1>
          <p className="text-gray-600">
            Welcome to TFS Book Club! Create a password to secure your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-gray-900"
              placeholder="Enter your new password"
              minLength="8"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-gray-900"
              placeholder="Re-enter your password"
              minLength="8"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-rose-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting Password...
                </span>
              ) : (
                'Set Password & Continue'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Already have a password?{' '}
            <Link href="/login" className="text-rose-600 hover:text-rose-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}