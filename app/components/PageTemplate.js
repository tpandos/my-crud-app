import Link from 'next/link'

export default function PageTemplate({ children, title }) {
  return (
    <div className="min-h-screen bg-rose-50">
      {/* 
        EXPLANATION:
        - min-h-screen: Makes page at least full viewport height
        - bg-rose-50: Very faint pink background (matches your theme)
      */}
      
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-rose-100">
        {/* 
          EXPLANATION:
          - bg-white: White background for header
          - shadow-sm: Subtle shadow underneath
          - border-b: Bottom border
          - border-rose-100: Very light pink border
        */}
        
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* 
            EXPLANATION:
            - max-w-7xl: Maximum width container
            - mx-auto: Centers the container
            - px-4: Padding on left/right
            - py-4: Padding on top/bottom
          */}
          
          <div className="flex justify-between items-center">
            {/* 
              EXPLANATION:
              - flex: Makes children arrange horizontally
              - justify-between: Pushes logo left, nav right
              - items-center: Vertically centers items
            */}
            
            {/* Logo */}
            <Link href="/" className="text-2xl font-heading font-bold text-rose-600 hover:text-rose-700">
              TFS Book Club
            </Link>
            
            {/* Navigation Links */}
            <nav className="flex gap-6">
              {/* 
                EXPLANATION:
                - flex: Arrange links horizontally
                - gap-6: Space between links (1.5rem / 24px)
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
            </nav>
          </div>
        </div>
      </header>

      {/* Page Title (if provided) */}
      {title && (
        <div className="bg-gradient-to-r from-rose-400 to-pink-500 py-8">
          {/* 
            EXPLANATION:
            - Gradient background for title section
            - py-8: Padding top/bottom (2rem / 32px)
            - {title && ...} means "only show if title exists"
          */}
          
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-heading font-bold text-white">
              {title}
            </h1>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 
          EXPLANATION:
          - main: Semantic HTML element for main content
          - max-w-7xl mx-auto: Centers content with max width
          - px-4: Padding on sides
          - py-8: Padding top/bottom
          - {children}: This is where the page content goes!
        */}
        
        {children}
      </main>

      {/* Optional Footer */}
      <footer className="bg-white border-t border-rose-100 mt-auto">
        {/* 
          EXPLANATION:
          - border-t: Top border
          - mt-auto: Pushes footer to bottom
        */}
        
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2026 TFS Book Club. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}