import Link from 'next/link'
import CommunityBoard from './components/CommunityBoard'
import EventCalendar from './components/EventCalendar'
import PollsDisplay from './components/PollsDisplay'

export default function Home() {
  return (
    <div className="min-h-screen bg-rose-50">
      {/* 
        DESIGN NOTE: bg-rose-50 is a very faint pink background
        It creates a soft, warm feel throughout the site
      */}
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-rose-400 to-pink-500 py-10">
        {/* 
          DESIGN CHANGES:
          1. Fixed typo: bg-linear-to-br → bg-gradient-to-br
          2. Reduced height: py-20 → py-10 (from 80px to 40px padding)
          3. Rose theme: from-rose-400 to-pink-500 (pretty pink gradient)
        */}
        
        <div className="max-w-4xl mx-auto text-center text-white px-4">
          <h1 className="text-6xl font-bold mb-4">Carla's Book Club</h1>
          <p className="text-xl mb-8">
            Some subtitle here
          </p>
          
          {/* Button Colors Updated to Rose Theme */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/login"
              className="bg-white text-rose-600 px-8 py-3 rounded-lg font-semibold hover:bg-rose-50 inline-block transition-colors shadow-lg"
            >
              {/* 
                DESIGN NOTE: 
                - text-rose-600 replaces text-red-600 (softer pink)
                - hover:bg-rose-50 adds subtle pink tint on hover
              */}
              Get Started
            </Link>
            <Link
              href="/books"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-rose-600 inline-block transition-colors"
            >
              {/* 
                DESIGN NOTE: hover:text-rose-600 instead of hover:text-blue-600
              */}
              Browse Books
            </Link>
            <Link
              href="/dashboard"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-rose-600 inline-block transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Community Board & Polls Side-by-Side Container */}
      <div className="bg-white">
        {/* 
          DESIGN NOTE: This wrapper creates a white background section
          to separate the side-by-side content from the pink background
        */}
        
        <div className="max-w-7xl mx-auto py-16 px-4">
          {/* 
            max-w-7xl = maximum width container (wider than max-w-4xl)
            mx-auto = centers the container
            py-16 = padding top/bottom
            px-4 = padding left/right (for mobile)
          */}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 
              GRID EXPLANATION:
              - grid: enables CSS grid layout
              - grid-cols-1: on mobile, 1 column (stacked)
              - lg:grid-cols-2: on large screens (1024px+), 2 columns (side-by-side)
              - gap-8: 2rem (32px) space between columns
              
              This makes it responsive:
              - Mobile: Stacked vertically
              - Desktop: Side by side
            */}
            
            {/* Left Column: Community Board */}
            <div>
              <CommunityBoard />
            </div>
            
            {/* Right Column: Polls */}
            <div>
              <PollsDisplay />
            </div>
          </div>
        </div>
      </div>

      {/* Event Calendar Section */}
      <EventCalendar />

      {/* Footer CTA */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 py-16">
        {/* 
          DESIGN NOTE: Updated footer gradient to match rose theme
          from-rose-500 to-pink-600 creates a richer, deeper pink
        */}
        
        <div className="max-w-4xl mx-auto text-center text-white px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg mb-8">
            Sign up now to manage your reading and stay connected!
          </p>
          <Link
            href="/login"
            className="bg-white text-rose-600 px-8 py-3 rounded-lg font-semibold hover:bg-rose-50 inline-block transition-colors shadow-lg"
          >
            {/* Updated button to rose theme */}
            Sign Up Free
          </Link>
        </div>
      </div>
    </div>
  )
}