'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BookDetailPage() {
  const params = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userBook, setUserBook] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    if (params.id) {
      fetchBook()
    }
  }, [params.id])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user && params.id) {
      fetchUserBook(user.id)
    }
  }

  const fetchBook = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching book:', error)
      alert('Book not found')
      router.push('/books')
    } else {
      setBook(data)
    }
    setLoading(false)
  }

  const fetchUserBook = async (userId) => {
    const { data, error } = await supabase
      .from('user_books')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', params.id)
      .single()

    if (!error && data) {
      setUserBook(data)
    }
  }

  const addToShelf = async (shelf) => {
    if (!user) {
      alert('Please sign in to add books to your shelf')
      router.push('/login')
      return
    }

    const now = new Date().toISOString()
    const bookData = {
      user_id: user.id,
      book_id: params.id,
      shelf: shelf,
      started_reading_at: shelf === 'reading' ? now : null,
      finished_reading_at: shelf === 'finished' ? now : null,
    }

    if (userBook) {
      // Update existing
      const { error } = await supabase
        .from('user_books')
        .update({
          shelf: shelf,
          started_reading_at: shelf === 'reading' ? (userBook.started_reading_at || now) : userBook.started_reading_at,
          finished_reading_at: shelf === 'finished' ? now : null,
          updated_at: now
        })
        .eq('id', userBook.id)

      if (error) {
        alert('Error updating shelf: ' + error.message)
      } else {
        alert('Shelf updated!')
        fetchUserBook(user.id)
      }
    } else {
      // Add new
      const { error } = await supabase
        .from('user_books')
        .insert([bookData])

      if (error) {
        alert('Error adding to shelf: ' + error.message)
      } else {
        alert('Added to shelf!')
        fetchUserBook(user.id)
      }
    }
  }

  const rateBook = async (rating) => {
    if (!user) {
      alert('Please sign in to rate books')
      router.push('/login')
      return
    }

    if (!userBook) {
      // If book not on shelf, add it to "finished" with rating
      const { error } = await supabase
        .from('user_books')
        .insert([{
          user_id: user.id,
          book_id: params.id,
          shelf: 'finished',
          rating: rating,
          finished_reading_at: new Date().toISOString()
        }])

      if (error) {
        alert('Error rating book: ' + error.message)
      } else {
        alert('Rating added!')
        fetchUserBook(user.id)
      }
    } else {
      // Update existing rating
      const { error } = await supabase
        .from('user_books')
        .update({
          rating: rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', userBook.id)

      if (error) {
        alert('Error updating rating: ' + error.message)
      } else {
        alert('Rating updated!')
        fetchUserBook(user.id)
      }
    }
  }

  const removeFromShelf = async () => {
    if (!userBook) return

    if (!confirm('Remove this book from your shelf?')) return

    const { error } = await supabase
      .from('user_books')
      .delete()
      .eq('id', userBook.id)

    if (error) {
      alert('Error removing book: ' + error.message)
    } else {
      alert('Book removed from shelf')
      setUserBook(null)
    }
  }

  const getShelfLabel = (shelf) => {
    const labels = {
      'want_to_read': 'Want to Read',
      'reading': 'Currently Reading',
      'finished': 'Finished'
    }
    return labels[shelf] || shelf
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading book...</div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Book not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/books"
          className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
        >
          ← Back to Books
        </Link>

        {/* Book Details */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Book Cover */}
            <div>
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-6xl">📖</span>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">by {book.author}</p>

              {/* Current Status */}
              {userBook && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    📚 On your shelf: <span className="font-bold">{getShelfLabel(userBook.shelf)}</span>
                  </p>
                  {userBook.rating && (
                    <p className="text-sm text-blue-800 mt-1">
                      ⭐ Your rating: {userBook.rating}/5
                    </p>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="flex gap-3 mb-6 flex-wrap">
                {book.genre && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {book.genre}
                  </span>
                )}
                {book.published_year && (
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    📅 {book.published_year}
                  </span>
                )}
                {book.page_count && (
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    📄 {book.page_count} pages
                  </span>
                )}
              </div>

              {/* Description */}
              {book.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{book.description}</p>
                </div>
              )}

              {/* ISBN */}
              {book.isbn && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">ISBN</h2>
                  <p className="text-gray-700">{book.isbn}</p>
                </div>
              )}

              {/* Shelf Buttons */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Add to shelf:</h3>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => addToShelf('want_to_read')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      userBook?.shelf === 'want_to_read'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    📚 Want to Read
                  </button>
                  <button
                    onClick={() => addToShelf('reading')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      userBook?.shelf === 'reading'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    📖 Currently Reading
                  </button>
                  <button
                    onClick={() => addToShelf('finished')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      userBook?.shelf === 'finished'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    ✅ Finished
                  </button>
                  {userBook && (
                    <button
                      onClick={removeFromShelf}
                      className="px-6 py-3 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Star Rating */}
<div>
  <h3 className="text-sm font-medium text-gray-700 mb-3">Your rating:</h3>
  <div className="flex gap-1 items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => rateBook(star)}
        className={`text-4xl transition-all hover:scale-125 ${
          star <= (userBook?.rating || 0)
            ? 'text-yellow-400'
            : 'text-gray-300 hover:text-yellow-200'
        }`}
        title={`Rate ${star} star${star > 1 ? 's' : ''}`}
      >
        {star <= (userBook?.rating || 0) ? '★' : '☆'}
      </button>
    ))}
    {userBook?.rating && (
      <span className="ml-3 text-lg font-medium text-gray-700">
        {userBook.rating}/5
      </span>
    )}
  </div>
  <p className="text-xs text-gray-500 mt-2">
    Click on a star to rate this book
  </p>
</div>
            </div>
          </div>
        </div>

        {/* Reviews Section - Coming Soon */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
          <p className="text-gray-500 text-center py-8">
            Reviews coming soon! We'll add this in the next feature.
          </p>
        </div>
      </div>
    </div>
  )
}