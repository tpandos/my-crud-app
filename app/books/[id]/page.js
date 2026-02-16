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
  
  // Reviews state
  const [reviews, setReviews] = useState([])
  const [userReview, setUserReview] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review_text: ''
  })
  const [averageRating, setAverageRating] = useState(null)
  const [reviewCount, setReviewCount] = useState(0)
  
  const router = useRouter()

  useEffect(() => {
    checkUser()
    if (params.id) {
      fetchBook()
      fetchReviews()
    }
  }, [params.id])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user && params.id) {
      fetchUserBook(user.id)
      fetchUserReview(user.id)
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

const fetchReviews = async () => {
  console.log('📚 Fetching reviews for book:', params.id)
  
  // Fetch all reviews for this book
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles (email)
    `)
    .eq('book_id', params.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching reviews:', error)
  } else {
    console.log('✅ Reviews fetched:', data)
    setReviews(data || [])
    setReviewCount(data?.length || 0)
    
    // Calculate average rating
    if (data && data.length > 0) {
      const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length
      setAverageRating(avg.toFixed(1))
      console.log('⭐ Average rating:', avg.toFixed(1))
    } else {
      setAverageRating(null)
    }
  }
}

  const fetchUserReview = async (userId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', params.id)
      .single()

    if (!error && data) {
      setUserReview(data)
      setReviewForm({
        rating: data.rating,
        review_text: data.review_text
      })
    }
  }

const handleReviewSubmit = async (e) => {
  e.preventDefault()

  if (!user) {
    alert('Please sign in to write a review')
    router.push('/login')
    return
  }

  try {
    if (userReview) {
      // Update existing review
      const { error } = await supabase
        .from('reviews')
        .update({
          rating: reviewForm.rating,
          review_text: reviewForm.review_text,
          updated_at: new Date().toISOString()
        })
        .eq('id', userReview.id)

      if (error) throw error

      alert('Review updated successfully!')
    } else {
      // Create new review
      const { error } = await supabase
        .from('reviews')
        .insert([{
          user_id: user.id,
          book_id: params.id,
          rating: reviewForm.rating,
          review_text: reviewForm.review_text
        }])

      if (error) throw error

      alert('Review posted successfully!')
    }

    // Close form
    setShowReviewForm(false)

    // Refresh reviews - wait for completion
    await fetchReviews()
    
    // Refresh user review
    if (user) {
      await fetchUserReview(user.id)
    }

  } catch (error) {
    console.error('Error with review:', error)
    alert('Error: ' + error.message)
  }
}

const handleDeleteReview = async () => {
  if (!confirm('Are you sure you want to delete your review?')) return

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', userReview.id)

    if (error) throw error

    alert('Review deleted')
    
    // Reset state
    setUserReview(null)
    setReviewForm({ rating: 5, review_text: '' })
    setShowReviewForm(false)
    
    // Refresh reviews
    await fetchReviews()

  } catch (error) {
    console.error('Error deleting review:', error)
    alert('Error deleting review: ' + error.message)
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
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
    <div className="min-h-screen bg-rose-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/books"
          className="text-rose-600 hover:text-rose-700 mb-6 inline-block font-medium"
        >
          ← Back to Books
        </Link>

        {/* Book Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
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

              {/* Average Rating Display */}
              {reviewCount > 0 && (
                <div className="mt-4 text-center bg-rose-50 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-3xl font-bold text-rose-600">{averageRating}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-2xl ${
                            star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
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
                  <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-medium">
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

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-heading font-bold text-gray-900">
              Reviews ({reviewCount})
            </h2>
            
            {user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-rose-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors"
              >
                {userReview ? 'Edit My Review' : 'Write a Review'}
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8 p-6 bg-rose-50 rounded-lg border border-rose-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {userReview ? 'Edit Your Review' : 'Write Your Review'}
              </h3>
              
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Rating Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`text-5xl transition-transform hover:scale-110 ${
                          star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        {star <= reviewForm.rating ? '★' : '☆'}
                      </button>
                    ))}
                    <span className="ml-3 text-2xl font-medium text-gray-700 self-center">
                      {reviewForm.rating}/5
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review *
                  </label>
                  <textarea
                    required
                    value={reviewForm.review_text}
                    onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none text-gray-900"
                    placeholder="What did you think of this book? Share your thoughts..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-rose-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors"
                  >
                    {userReview ? 'Update Review' : 'Post Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  {userReview && (
                    <button
                      type="button"
                      onClick={handleDeleteReview}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors ml-auto"
                    >
                      Delete Review
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg mb-4">
                No reviews yet. Be the first to review this book!
              </p>
              {user && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-rose-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-rose-700 transition-colors"
                >
                  Write the First Review
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    review.user_id === user?.id
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {/* Review Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">
                          {review.profiles?.email?.split('@')[0] || 'Anonymous'}
                        </span>
                        {review.user_id === user?.id && (
                          <span className="bg-rose-200 text-rose-800 text-xs px-2 py-1 rounded-full font-medium">
                            Your Review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg ${
                                star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {review.review_text}
                  </p>

                  {/* Edit timestamp if updated */}
                  {review.updated_at !== review.created_at && (
                    <p className="text-xs text-gray-500 mt-3 italic">
                      Edited {formatDate(review.updated_at)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}