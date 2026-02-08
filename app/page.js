import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white px-4">
        <h1 className="text-6xl font-bold mb-4">My CRUD App</h1>
        <p className="text-xl mb-8">
          A simple, beautiful todo app built with Next.js & Supabase
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 inline-block transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}