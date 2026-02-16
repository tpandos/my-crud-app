'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  // Decide where Member button should go
  const memberUrl = user ? '/dashboard' : '/login'
  const memberText = user ? 'Go to Dashboard' : 'Member'

  return (
    <div className="min-h-screen flex">
      {/* Left Side - 40% - Gradient Pink */}
      <div className="w-2/5 bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 flex items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles for depth */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10 text-white">
          <h1 className="font-heading text-6xl md:text-7xl font-bold mb-4 leading-tight">
            TFS<br />Book Club
          </h1>
          <p className="font-body text-xl md:text-2xl font-light opacity-90">
            Soca, reading and eating snacks.
          </p>
        </div>
      </div>

      {/* Right Side - 60% - Light Pink */}
      <div className="w-3/5 bg-rose-50 flex items-center justify-center p-12">
        <div className="max-w-md w-full space-y-6">
          {/* Welcome Text */}
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-gray-900 mb-3">
              {user ? `Welcome back!` : 'Welcome'}
            </h2>
            <p className="text-gray-600 text-lg">
              {user ? user.email : 'Join our community of book lovers'}
            </p>
          </div>

          {/* Show loading state while checking auth */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Member Button - Smart Link */}
              <Link href={memberUrl} className="group block">
                <div className="relative">
                  {/* Main button body */}
                  <div className="bg-rose-600 text-white px-8 py-4 flex items-center justify-between transition-all duration-300 group-hover:bg-rose-700 group-hover:shadow-xl group-hover:scale-105">
                    <span className="font-semibold text-lg">{memberText}</span>
                    <svg className="w-6 h-6 transform transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  {/* Pointy arrow on right */}
                  <div className="absolute top-0 -right-3 w-0 h-0 border-t-[28px] border-t-transparent border-l-[20px] border-l-rose-600 border-b-[28px] border-b-transparent transition-all duration-300 group-hover:border-l-rose-700 group-hover:-right-4"></div>
                </div>
              </Link>

              {/* Request Access Button - Only show if NOT logged in */}
              {!user && (
                <Link href="/request-access" className="group block">
                  <div className="relative">
                    {/* Main button body */}
                    <div className="bg-white text-rose-600 border-2 border-rose-600 px-8 py-4 flex items-center justify-between transition-all duration-300 group-hover:bg-rose-50 group-hover:shadow-xl group-hover:scale-105">
                      <span className="font-semibold text-lg">Request Access</span>
                      <svg className="w-6 h-6 transform transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    {/* Pointy arrow on right */}
                    <div className="absolute top-0 -right-3 w-0 h-0 border-t-[28px] border-t-transparent border-l-[20px] border-l-white border-b-[28px] border-b-transparent transition-all duration-300 group-hover:-right-4"></div>
                    {/* Arrow border for outline button */}
                    <div className="absolute top-0 -right-3 w-0 h-0 border-t-[30px] border-t-transparent border-l-[22px] border-l-rose-600 border-b-[30px] border-b-transparent"></div>
                  </div>
                </Link>
              )}

              {/* If logged in, show additional quick links */}
              {user && (
                <div className="space-y-3 pt-4">
                  <Link 
                    href="/books"
                    className="block text-center text-rose-600 hover:text-rose-700 font-medium transition-colors"
                  >
                    Browse Books →
                  </Link>
                  <Link 
                    href="/my-books"
                    className="block text-center text-rose-600 hover:text-rose-700 font-medium transition-colors"
                  >
                    My Books →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Optional: Small footer text */}
          <div className="text-center pt-8 text-sm text-gray-500">
            {user ? 'Ready to explore?' : 'Join our community today'}
          </div>
        </div>
      </div>
    </div>
  )
}