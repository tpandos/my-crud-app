'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'  // ← ADD THIS IMPORT!
import Link from 'next/link'

export default function RequestAccessPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    favoriteBook: ''
  })
  
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

const handleSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)
  setError('')

  try {
    // Save to database via API route (bypasses RLS)
    const response = await fetch('/api/request-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        favorite_book: formData.favoriteBook || null
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit request')
    }

    // Send email notification to admin
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: 'd1639c5a-3244-43bb-98c8-684e105bf812', // Your Web3Forms key
        subject: '🎉 New TFS Book Club Access Request',
        from_name: formData.name,
        email: formData.email,
        message: `
New Access Request Received!

Name: ${formData.name}
Email: ${formData.email}

Why they want to join:
${formData.message}

Favorite Book: ${formData.favoriteBook || 'Not provided'}

---
Review in admin dashboard:
${window.location.origin}/admin

Submitted: ${new Date().toLocaleString()}
        `
      })
    })

    console.log('✅ Request saved and email sent!')
    setSubmitted(true)

  } catch (err) {
    console.error('❌ Error:', err)
    setError('Something went wrong. Please try again or email us directly.')
  } finally {
    setIsSubmitting(false)
  }
}

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">
              Request Submitted!
            </h2>
            
            <p className="text-gray-600 mb-2">
              Thank you for your interest in TFS Book Club, <strong>{formData.name}</strong>!
            </p>
            
            <p className="text-gray-600 mb-6">
              We'll review your request and get back to you at <strong>{formData.email}</strong> soon.
            </p>
            
            <div className="bg-rose-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">Why you want to join:</span>
              </p>
              <p className="text-sm text-gray-600 italic">
                "{formData.message}"
              </p>
              
              {formData.favoriteBook && (
                <p className="text-sm text-gray-600 mt-3">
                  <span className="font-semibold">Favorite book:</span> {formData.favoriteBook}
                </p>
              )}
            </div>
            
            <Link
              href="/"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Form Screen
  return (
    <div className="min-h-screen bg-rose-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-block mb-6 text-rose-600 hover:text-rose-700 font-medium transition-colors"
          >
            ← Back to Home
          </Link>
          
          <h1 className="font-heading text-4xl font-bold text-gray-900 mb-3">
            Request Access
          </h1>
          
          <p className="text-gray-600 text-lg">
            We'd love to have you join TFS Book Club! Tell us a bit about yourself.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-gray-900"
                placeholder="Jane Smith"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-gray-900"
                placeholder="jane@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll send your access confirmation to this email
              </p>
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to join TFS Book Club? *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none transition-all text-gray-900"
                placeholder="I love reading and would enjoy discussing books with other members. I'm particularly interested in..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Tell us about your reading interests or what excites you about joining
              </p>
            </div>

            {/* Favorite Book Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your favorite book? (Optional)
              </label>
              <input
                type="text"
                value={formData.favoriteBook}
                onChange={(e) => setFormData({ ...formData, favoriteBook: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-gray-900"
                placeholder="Pride and Prejudice"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-rose-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-rose-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Already a member?{' '}
              <Link href="/login" className="text-rose-600 hover:text-rose-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            What happens next?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 ml-7">
            <li>• We'll review your request within 24-48 hours</li>
            <li>• You'll receive an email with your decision</li>
            <li>• If approved, you'll get login instructions</li>
            <li>• Then you can start tracking books and joining discussions!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}