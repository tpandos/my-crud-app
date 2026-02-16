import Link from 'next/link'

export default function PageTemplate({ children, title, showBackButton = false, backUrl = '/' }) {
  return (
    <div className="min-h-screen bg-rose-50 flex flex-col">
      {/* 
        EXPLANATION:
        - min-h-screen: Full viewport height
        - bg-rose-50: Faint pink background (consistent theme)
        - flex flex-col: Stack header, main, footer vertically
      */}
      
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-rose-100 sticky top-0 z-50">
        {/* 
          EXPLANATION:
          - sticky top-0: Header stays at top when scrolling
          - z-50: Appears above other content
          - border-rose-100: Subtle pink border
        */}
        
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link 
              href="/" 
              className="text-2xl font-heading font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              TFS Book Club
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex gap-6 items-center">
              {/* 
                EXPLANATION:
                - hidden md:flex: Hidden on mobile, visible on desktop
                - gap-6: Space between nav links
              */}
              
              <Link 
                href="/" 
                className="text-gray-700 hover:text-rose-600 transition-colors font-medium"
              >
                Home
              </Link>
              <Link 
                href="/books" 
                className="text-gray-700 hover:text-rose-600 transition-colors font-medium"
              >
                Books
              </Link>
              <Link 
                href="/my-books" 
                className="text-gray-700 hover:text-rose-600 transition-colors font-medium"
              >
                My Books
              </Link>
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-rose-600 transition-colors font-medium"
              >
                Dashboard
              </Link>
              
              {/* Member Button */}
              <Link 
                href="/login" 
                className="bg-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors"
              >
                Member
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-700 hover:text-rose-600">
              {/* 
                EXPLANATION:
                - md:hidden: Only visible on mobile
                - We'll keep it simple - just shows same links in vertical layout
              */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation (visible when menu is open - simplified for now) */}
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-200 flex flex-col gap-3">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-rose-600 transition-colors font-medium py-2"
            >
              Home
            </Link>
            <Link 
              href="/books" 
              className="text-gray-700 hover:text-rose-600 transition-colors font-medium py-2"
            >
              Books
            </Link>
            <Link 
              href="/my-books" 
              className="text-gray-700 hover:text-rose-600 transition-colors font-medium py-2"
            >
              My Books
            </Link>
            <Link 
              href="/dashboard" 
              className="text-gray-700 hover:text-rose-600 transition-colors font-medium py-2"
            >
              Dashboard
            </Link>
            <Link 
              href="/login" 
              className="bg-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors text-center"
            >
              Member
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Title Section (optional) */}
      {title && (
        <div className="bg-gradient-to-r from-rose-400 to-pink-500 py-8 shadow-sm">
          {/* 
            EXPLANATION:
            - Only shows if title prop is provided
            - Gradient matches your theme
          */}
          
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {showBackButton && (
                  <Link 
                    href={backUrl}
                    className="text-white hover:text-rose-100 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </Link>
                )}
                <h1 className="text-4xl font-heading font-bold text-white">
                  {title}
                </h1>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* 
          EXPLANATION:
          - flex-1: Takes remaining space (pushes footer down)
          - max-w-7xl: Maximum width container
          - mx-auto: Centers content
          - {children}: Your page content goes here!
        */}
        
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-rose-100 mt-auto">
        {/* 
          EXPLANATION:
          - mt-auto: Pushes footer to bottom
          - border-t: Top border
        */}
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1: About */}
            <div>
              <h3 className="font-heading font-bold text-gray-900 mb-3">
                TFS Book Club
              </h3>
              <p className="text-gray-600 text-sm">
                Zumba and reading and eating snacks. Join our community of book lovers!
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="font-heading font-bold text-gray-900 mb-3">
                Quick Links
              </h3>
              <div className="flex flex-col gap-2">
                <Link href="/books" className="text-gray-600 hover:text-rose-600 text-sm transition-colors">
                  Browse Books
                </Link>
                <Link href="/my-books" className="text-gray-600 hover:text-rose-600 text-sm transition-colors">
                  My Books
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-rose-600 text-sm transition-colors">
                  Dashboard
                </Link>
                <Link href="/request-access" className="text-gray-600 hover:text-rose-600 text-sm transition-colors">
                  Request Access
                </Link>
              </div>
            </div>

            {/* Column 3: Connect */}
            <div>
              <h3 className="font-heading font-bold text-gray-900 mb-3">
                Connect
              </h3>
              <div className="flex flex-col gap-2">
                <Link href="/login" className="text-gray-600 hover:text-rose-600 text-sm transition-colors">
                  Member Login
                </Link>
                <p className="text-gray-600 text-sm">
                  © 2026 TFS Book Club
                </p>
                <p className="text-gray-500 text-xs">
                  All rights reserved
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}