import Link from 'next/link'
import CommunityBoard from './components/CommunityBoard'
import EventCalendar from './components/EventCalendar'
import PollsDisplay from './components/PollsDisplay'

export default function Home() {
  return (
    <div className="min-h-screen bg-rose-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-rose-400 to-pink-500 py-10">
        <div className="max-w-4xl mx-auto text-center text-white px-4">
          <h1 className="font-heading text-6xl font-bold mb-4">
            TFS Book Club
          </h1>
          <p className="font-body text-xl mb-8 font-light">
            Zumba and reading and eating snacks.
          </p>
          
          {/* New Navigation Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            {/* Member Button - Solid white, primary action */}
            <Link
              href="/login"
              className="font-sans bg-white text-rose-600 px-8 py-3 rounded-lg font-semibold hover:bg-rose-50 hover:scale-105 inline-block transition-all duration-300 shadow-lg"
            >
              Member
            </Link>
            
            {/* Request Access Button - Transparent with border, secondary action */}
            <Link
              href="/request-access"
              className="font-sans bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-rose-600 hover:scale-105 inline-block transition-all duration-300 shadow-lg"
            >
              Request Access
            </Link>
          </div>
        </div>
      </div>
            
      {/* Community Board & Polls Side-by-Side Container */}
      <div className="bg-pink-50">
        <div className="max-w-7xl mx-auto py-16 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Community Board */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <CommunityBoard />
            </div>
            
            {/* Right Column: Polls */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <PollsDisplay />
            </div>
          </div>
        </div>
      </div>

      {/* Event Calendar Section */}
      <EventCalendar />

      {/* Footer CTA */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto text-center text-white px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg mb-8">
            Sign up now to manage your reading and stay connected!
          </p>
          <Link
            href="/request-access"
            className="bg-white text-rose-600 px-8 py-3 rounded-lg font-semibold hover:bg-rose-50 hover:scale-105 inline-block transition-all duration-300 shadow-lg"
          >
            Request Access
          </Link>
        </div>
      </div>
    </div>
  )
}