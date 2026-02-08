'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function BooksPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGenre, setSelectedGenre] = useState('all')

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title', { ascending: true })

    if (!error) {
      setBooks(data || [])
    }
    setLoading(false)
  }

  const genres = ['all', ...new Set(books.map(book => book.genre).filter(Boolean))]

  const filteredBooks = selectedGenre === 'all' 
    ? books 
    : books.filter(book => book.genre === selectedGenre)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading books...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-gray-900">📚 Book Catalog</h1>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Home
            </Link>
          </div>
          <p className="text-gray-600 text-lg">
            Browse our collection of {books.length} books
          </p>
        </div>

        {/* Genre Filter */}
        {genres.length > 1 && (
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    selectedGenre === genre
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {genre === 'all' ? 'All Books' : genre}
                  {genre !== 'all' && (
                    <span className="ml-1 text-xs">
                      ({books.filter(b => b.genre === genre).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No books found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow p-4 group"
              >
                {/* Book Cover */}
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-64 object-cover rounded mb-3 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">📖</span>
                  </div>
                )}

                {/* Book Info */}
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                
                {book.genre && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {book.genre}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}