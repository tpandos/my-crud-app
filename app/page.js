'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Test connection by querying the todos table
    const testConnection = async () => {
      try {
        // This should work now! (returns empty array, but no error)
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .limit(1)
        
        if (error) {
          setError(error.message)
          console.error('❌ Database error:', error)
        } else {
          setConnected(true)
          console.log('✅ Database connected! Todos table exists!')
          console.log('Current todos:', data)
        }
      } catch (err) {
        setError(err.message)
        console.error('❌ Connection error:', err)
      }
    }
    testConnection()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">My CRUD App</h1>
        <p className="text-xl mb-4">
          {connected && '✅ Database Ready!'}
          {!connected && !error && '⏳ Connecting to database...'}
          {error && `❌ Error: ${error}`}
        </p>
        <p className="text-lg mb-8">A simple todo app built with Next.js & Supabase</p>
        <Link
          href="/login"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
