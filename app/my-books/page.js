'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MyBooksPage() {
  const [user, setUser] = useState(null)
  const [userBooks, setUserBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeShelf, setActiveShelf] = useState('all')
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
      fetchUserBooks(user.id)
    }
    setLoading(false)
  }

  const fetchUserBooks = async (userId) => {
    const { data, error } = await supabase
      .from('user_books')
      .select(`
        *,
        books (*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (!error) {
      setUserBooks(data || [])
    }
  }

  const getShelfCounts = () => {
    return {
      all: userBooks.length,
      want_to_read: userBooks.filter(ub => ub.shelf === 'want_to_read').length,
      reading: userBooks.filter(ub => ub.shelf === 'reading').length,
      finished: userBooks.filter(ub => ub.shelf === 'finished').length,
    }
  }

  const filteredBooks = activeShelf === 'all'
    ? userBooks
    : userBooks.filter(ub => ub.shelf === activeShelf)

  const getShelfLabel = (shelf) => {
    const labels = {
      'all': 'All Books',
      'want_to_read': 'Want to Read',
      'reading': 'Currently Reading',
      'finished': 'Finished'
    }
    return labels[shelf] || shelf
  }

  const getShelfEmoji = (shelf) => {
    const emojis = {
      'all': '📚',
      'want_to_read': '📚',
      'reading': '📖',
      'finished': '✅'
    }
    return emojis[shelf] || '📚'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading your books...</div>
      </div>
    )
  }

  const counts = getShelfCounts()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">📚 My Books</h1>
              <p className="text-gray-600 mt-1">{user?.email}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/books"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Browse Books
              </Link>
              <Link
                href="/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Shelf Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 p-2">
          <div className="flex gap-2 flex-wrap">
            {['all', 'want_to_read', 'reading', 'finished'].map((shelf) => (
              <button
                key={shelf}
                onClick={() => setActiveShelf(shelf)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeShelf === shelf
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getShelfEmoji(shelf)} {getShelfLabel(shelf)} ({counts[shelf]})
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{counts.all}</p>
            <p className="text-gray-600 text-sm mt-1">Total Books</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{counts.want_to_read}</p>
            <p className="text-gray-600 text-sm mt-1">Want to Read</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{counts.reading}</p>
            <p className="text-gray-600 text-sm mt-1">Currently Reading</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-orange-600">{counts.finished}</p>
            <p className="text-gray-600 text-sm mt-1">Finished</p>
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              {activeShelf === 'all' 
                ? "You haven't added any books yet"
                : `No books in "${getShelfLabel(activeShelf)}"`}
            </p>
            <Link
              href="/books"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Browse Books →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((userBook) => (
              <Link
                key={userBook.id}
                href={`/books/${userBook.books.id}`}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow p-4 group"
              >
                {/* Book Cover */}
                {userBook.books.cover_url ? (
                  <img
                    src={userBook.books.cover_url}
                    alt={userBook.books.title}
                    className="w-full h-64 object-cover rounded mb-3 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">📖</span>
                  </div>
                )}

                {/* Book Info */}
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600">
                  {userBook.books.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{userBook.books.author}</p>
                
                {/* Rating */}
{userBook.rating && (
  <div className="flex items-center gap-1 mb-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`text-lg ${
          star <= userBook.rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        {star <= userBook.rating ? '★' : '☆'}
      </span>
    ))}
    <span className="text-xs text-gray-600 ml-1">
      ({userBook.rating})
    </span>
  </div>
)}

                {/* Shelf Badge */}
                <span className={`inline-block text-xs px-2 py-1 rounded ${
                  userBook.shelf === 'want_to_read' ? 'bg-blue-100 text-blue-800' :
                  userBook.shelf === 'reading' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {getShelfLabel(userBook.shelf)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}