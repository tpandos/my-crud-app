'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { isUserAdmin } from '@/lib/adminHelpers'
import PageTemplate from '../components/PageTemplate'
import CommunityBoard from '../components/CommunityBoard'
import EventCalendar from '../components/EventCalendar'
import PollsDisplay from '../components/PollsDisplay'
import Link from 'next/link'

// Admin Link Component
function AdminLink() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const admin = await isUserAdmin()
    setIsAdmin(admin)
  }

  if (!isAdmin) return null

  return (
    <Link
      href="/admin"
      className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
    >
      <span>🔧</span>
      <span className="font-medium">Admin</span>
    </Link>
  )
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [userBooks, setUserBooks] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Stats
  const [bookStats, setBookStats] = useState({
    total: 0,
    reading: 0,
    finished: 0,
    wantToRead: 0
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
      fetchProfile(user.id)
      fetchUserBooks(user.id)
      fetchRecentReviews(user.id)
    }
    setLoading(false)
  }

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile(data)
    }
  }

  const fetchUserBooks = async (userId) => {
    const { data, error } = await supabase
      .from('user_books')
      .select(`
        *,
        books (*)
      `)
      .eq('user_id', userId)

    if (!error && data) {
      setUserBooks(data)
      
      // Calculate stats
      setBookStats({
        total: data.length,
        reading: data.filter(b => b.shelf === 'reading').length,
        finished: data.filter(b => b.shelf === 'finished').length,
        wantToRead: data.filter(b => b.shelf === 'want_to_read').length
      })
    }
  }

  const fetchRecentReviews = async (userId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        books (title, cover_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3)

    if (!error && data) {
      setRecentReviews(data)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <PageTemplate>
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-600">Loading your dashboard...</div>
        </div>
      </PageTemplate>
    )
  }

  // Get currently reading books
  const currentlyReading = userBooks.filter(b => b.shelf === 'reading').slice(0, 3)

  return (
    <PageTemplate title="Dashboard">
      <div className="space-y-6">
        
        {/* ========================================
            SECTION 1: HEADER WITH USER PROFILE
            ======================================== */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* User Profile */}
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                {user?.email?.[0].toUpperCase()}
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="text-3xl font-heading font-bold mb-1">
                  Welcome back!
                </h1>
                <p className="text-white/90 text-lg">
                  {user?.email}
                </p>
                <p className="text-white/70 text-sm mt-1">
                  {profile?.role === 'admin' ? '👑 Administrator' : '📚 Member'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <AdminLink />
              <button
                onClick={handleSignOut}
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-all border border-white/30 flex items-center gap-2"
              >
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================
            SECTION 2: STATS CARDS (4 COLUMNS)
            Grid: 1 column mobile → 2 columns tablet → 4 columns desktop
            ======================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        </div>

        {/* ========================================
            Testing content full size 
            ======================================== */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <CommunityBoard />
        </div>

        {/* 
          ✨ ADD FULL-WIDTH COMPONENTS HERE ✨
          Example:
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2>Full Width Component</h2>
          </div>
        */}

        {/* ========================================
            SECTION 3: MAIN CONTENT (2/3 + 1/3 SPLIT)
            Grid: Stacked mobile → 2/3 left, 1/3 right on desktop
            ======================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ===== LEFT COLUMN (2/3 WIDTH) ===== */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Currently Reading Books */}
            {currentlyReading.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                    <span>📖</span>
                    Currently Reading
                  </h2>
                  <Link 
                    href="/my-books"
                    className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {currentlyReading.map((userBook) => (
                    <Link
                      key={userBook.id}
                      href={`/books/${userBook.books.id}`}
                      className="flex items-center gap-4 p-4 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors group"
                    >
                      {/* Book Cover */}
                      {userBook.books.cover_url ? (
                        <img
                          src={userBook.books.cover_url}
                          alt={userBook.books.title}
                          className="w-16 h-24 object-cover rounded shadow-md group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-16 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center">
                          <span className="text-2xl">📖</span>
                        </div>
                      )}
                      
                      {/* Book Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                          {userBook.books.title}
                        </h3>
                        <p className="text-sm text-gray-600">{userBook.books.author}</p>
                        
                        {/* Reading Progress (Mock - you can add real progress later) */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>65%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-rose-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Reviews */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <PollsDisplay />
          </div>

            {recentReviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>⭐</span>
                  Recent Reviews
                </h2>
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <Link
                      key={review.id}
                      href={`/books/${review.book_id}`}
                      className="block p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {review.books.cover_url && (
                          <img
                            src={review.books.cover_url}
                            alt={review.books.title}
                            className="w-12 h-16 object-cover rounded shadow"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{review.books.title}</h3>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{review.review_text}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 
              ✨ ADD NEW COMPONENTS HERE ✨
              Example:
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2>Your New Component</h2>
              </div>
            */}           
          </div>

          {/* ===== RIGHT COLUMN (1/3 WIDTH) ===== */}
          <div className="space-y-6">
            
            {/* Bookshelf Snapshot */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-heading font-bold text-gray-900">
                  📚 My Shelves
                </h2>
                <Link 
                  href="/my-books"
                  className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                >
                  View →
                </Link>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Want to Read</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {bookStats.wantToRead}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Reading</span>
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {bookStats.reading}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Finished</span>
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {bookStats.finished}
                  </span>
                </div>
              </div>
              
              {/* Mini Book Covers */}
              {userBooks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Recent additions</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {userBooks.slice(0, 5).map((userBook) => (
                      <Link
                        key={userBook.id}
                        href={`/books/${userBook.books.id}`}
                        className="flex-shrink-0"
                      >
                        {userBook.books.cover_url ? (
                          <img
                            src={userBook.books.cover_url}
                            alt={userBook.books.title}
                            className="w-12 h-16 object-cover rounded shadow hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center text-lg">
                            📖
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl shadow-lg p-6 border border-rose-100">
              <h2 className="text-lg font-heading font-bold text-gray-900 mb-4">
                📊 Your Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Books in Library</span>
                  <span className="font-bold text-blue-600">{bookStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Currently Reading</span>
                  <span className="font-bold text-green-600">{bookStats.reading}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Books Finished</span>
                  <span className="font-bold text-purple-600">{bookStats.finished}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reviews Written</span>
                  <span className="font-bold text-orange-600">{recentReviews.length}</span>
                </div>
              </div>
            </div>

            {/* Reading Streak (Mock - you can add real tracking later) */}
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg p-6 text-white">
              <div className="text-center">
                <div className="text-5xl mb-2">🔥</div>
                <div className="text-4xl font-bold mb-1">7</div>
                <div className="text-white/90 text-sm">Day Reading Streak</div>
              </div>
            </div>

            {/* 
              ✨ ADD SIDEBAR COMPONENTS HERE ✨
              Example:
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2>Sidebar Component</h2>
              </div>
            */}
            
          </div>
        </div>

        {/* ========================================
            SECTION 4: COMMUNITY (50/50 SPLIT)
            Grid: Stacked mobile → Side by side desktop
            ======================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          


          {/* Polls (Right) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <PollsDisplay />
          </div>
          
        </div>

        {/* ========================================
            SECTION 5: EVENTS CALENDAR (FULL WIDTH)
            No grid = takes full width
            ======================================== */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <EventCalendar />
        </div>

        {/* 
          ✨ ADD FULL-WIDTH COMPONENTS HERE ✨
          Example:
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2>Full Width Component</h2>
          </div>
        */}
        
      </div>
    </PageTemplate>
  )
}