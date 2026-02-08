import Link from 'next/link'
import CommunityBoard from './components/CommunityBoard'
import EventCalendar from './components/EventCalendar'
import PollsDisplay from './components/PollsDisplay'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto text-center text-white px-4">
          <h1 className="text-6xl font-bold mb-4">My CRUD App</h1>
          <p className="text-xl mb-8">
            A simple, beautiful community platform built with Next.js & Supabase
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block transition-colors shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/books"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 inline-block transition-colors"
            >
              Browse Books
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

      {/* Community Board Section */}
      <CommunityBoard />

      {/* Community Board Section */}
<CommunityBoard />

{/* Polls Section */}
<PollsDisplay />

      {/* Event Calendar Section */}
      <EventCalendar />

      {/* Footer CTA */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-500 py-16">
        <div className="max-w-4xl mx-auto text-center text-white px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg mb-8">
            Sign up now to manage your tasks and stay connected!
          </p>
          <Link
            href="/login"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block transition-colors shadow-lg"
          >
            Sign Up Free
          </Link>
        </div>
      </div>
    </div>
  )
}