'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import PageTemplate from '../components/PageTemplate'
import { isUserAdmin } from '@/lib/adminHelpers'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('books') // 'books', 'polls', 'posts', 'events', or 'access'
  const [currentUser, setCurrentUser] = useState(null)
  
  // Books State
  const [books, setBooks] = useState([])
  const [editingBook, setEditingBook] = useState(null)
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    description: '',
    cover_url: '',
    isbn: '',
    genre: '',
    published_year: '',
    page_count: ''
  })
  
  // Polls State
  const [polls, setPolls] = useState([])
  const [booksForPolls, setBooksForPolls] = useState([])
  const [editingPoll, setEditingPoll] = useState(null)
  const [pollForm, setPollForm] = useState({
    question: '',
    description: '',
    deadline: '',
    is_active: true
  })
  const [pollOptions, setPollOptions] = useState(['', '', ''])
  
  // Community Posts State
  const [posts, setPosts] = useState([])
  const [editingPost, setEditingPost] = useState(null)
  const [postForm, setPostForm] = useState({ title: '', content: '', is_pinned: false })
  
  // Events State
  const [events, setEvents] = useState([])
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventForm, setEventForm] = useState({ 
    title: '', 
    description: '', 
    event_date: '', 
    event_time: '', 
    location: '' 
  })

  // Access Requests State
  const [accessRequests, setAccessRequests] = useState([])
  const [processingRequest, setProcessingRequest] = useState(null)

  const router = useRouter()

  useEffect(() => {
    checkAdminStatus()
  }, [])

  useEffect(() => {
    if (isAdmin && currentUser) {
      if (activeTab === 'access') fetchAccessRequests()
    }
  }, [activeTab, isAdmin, currentUser])

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    setCurrentUser(user)

    const adminStatus = await isUserAdmin()
    
    if (!adminStatus) {
      alert('Access denied. Admin privileges required.')
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
    fetchBooks()
    fetchBooksForPolls()
    fetchPolls()
    fetchPosts()
    fetchEvents()
    setLoading(false)
  }

  
  // ========== ACCESS REQUESTS FUNCTIONS ==========

  const fetchAccessRequests = async () => {
    const { data, error } = await supabase
      .from('access_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setAccessRequests(data || [])
    } else {
      console.error('Error fetching access requests:', error)
    }
  }

  const approveRequest = async (request, role = 'user') => {
    if (!confirm(`Approve ${request.name} as ${role}?\n\nYou'll need to create their account in Supabase.`)) return

    setProcessingRequest(request.id)

    try {
      const { error } = await supabase
        .from('access_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentUser.id,
          notes: `Approved as ${role}`
        })
        .eq('id', request.id)

      if (error) throw error

      alert(`✅ Request Approved!

Next Steps:
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Invite User"
3. Enter email: ${request.email}
4. Send invitation (they'll receive email to set password)

Then set their role:
1. Go to SQL Editor
2. Run: 
   update profiles 
   set role = '${role}' 
   where email = '${request.email}';

OR manually edit the profiles table.`)

      fetchAccessRequests()
    } catch (err) {
      console.error('Error:', err)
      alert('Error: ' + err.message)
    } finally {
      setProcessingRequest(null)
    }
  }

  const rejectRequest = async (request) => {
    const reason = prompt('Reason for rejection (optional):')
    if (reason === null) return // User cancelled

    setProcessingRequest(request.id)

    try {
      const { error } = await supabase
        .from('access_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentUser.id,
          notes: reason || 'No reason provided'
        })
        .eq('id', request.id)

      if (error) throw error

      alert('Request rejected')
      fetchAccessRequests()
    } catch (err) {
      console.error('Error:', err)
      alert('Error: ' + err.message)
    } finally {
      setProcessingRequest(null)
    }
  }

  // ========== BOOKS FUNCTIONS ==========
  // ... (keep all your existing book functions exactly as they are)

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setBooks(data || [])
    }
  }

  const handleBookSubmit = async (e) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase.auth.getUser()

    const bookData = {
      title: bookForm.title,
      author: bookForm.author,
      description: bookForm.description || null,
      cover_url: bookForm.cover_url || null,
      isbn: bookForm.isbn || null,
      genre: bookForm.genre || null,
      published_year: bookForm.published_year ? parseInt(bookForm.published_year) : null,
      page_count: bookForm.page_count ? parseInt(bookForm.page_count) : null,
    }

    if (editingBook) {
      const { error } = await supabase
        .from('books')
        .update({
          ...bookData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingBook.id)

      if (error) {
        alert('Error updating book: ' + error.message)
      } else {
        alert('Book updated successfully!')
        setEditingBook(null)
        setBookForm({
          title: '', author: '', description: '', cover_url: '',
          isbn: '', genre: '', published_year: '', page_count: ''
        })
        fetchBooks()
        fetchBooksForPolls()
      }
    } else {
      const { error } = await supabase
        .from('books')
        .insert([{
          ...bookData,
          created_by: user.id
        }])

      if (error) {
        alert('Error creating book: ' + error.message)
      } else {
        alert('Book added successfully!')
        setBookForm({
          title: '', author: '', description: '', cover_url: '',
          isbn: '', genre: '', published_year: '', page_count: ''
        })
        fetchBooks()
        fetchBooksForPolls()
      }
    }
  }

  const editBook = (book) => {
    setEditingBook(book)
    setBookForm({
      title: book.title,
      author: book.author,
      description: book.description || '',
      cover_url: book.cover_url || '',
      isbn: book.isbn || '',
      genre: book.genre || '',
      published_year: book.published_year || '',
      page_count: book.page_count || ''
    })
  }

  const deleteBook = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting book: ' + error.message)
    } else {
      alert('Book deleted!')
      fetchBooks()
      fetchBooksForPolls()
    }
  }

  const cancelBookEdit = () => {
    setEditingBook(null)
    setBookForm({
      title: '', author: '', description: '', cover_url: '',
      isbn: '', genre: '', published_year: '', page_count: ''
    })
  }

  // ========== POLLS FUNCTIONS ==========
  // ... (keep all your existing poll functions)

  const fetchPolls = async () => {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (
          *,
          books (title, author)
        )
      `)
      .order('created_at', { ascending: false })

    if (!error) {
      setPolls(data || [])
    }
  }

  const fetchBooksForPolls = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('id, title, author')
      .order('title', { ascending: true })

    if (!error) {
      setBooksForPolls(data || [])
    }
  }

  const handlePollSubmit = async (e) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase.auth.getUser()

    const validOptions = pollOptions.filter(opt => opt.trim() !== '')
    if (validOptions.length < 2) {
      alert('Please add at least 2 options')
      return
    }

    if (editingPoll) {
      const { error } = await supabase
        .from('polls')
        .update({
          question: pollForm.question,
          description: pollForm.description,
          deadline: pollForm.deadline || null,
          is_active: pollForm.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPoll.id)

      if (error) {
        alert('Error updating poll: ' + error.message)
      } else {
        alert('Poll updated successfully!')
        setEditingPoll(null)
        setPollForm({ question: '', description: '', deadline: '', is_active: true })
        setPollOptions(['', '', ''])
        fetchPolls()
      }
    } else {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert([{
          question: pollForm.question,
          description: pollForm.description,
          deadline: pollForm.deadline || null,
          is_active: pollForm.is_active,
          created_by: user.id
        }])
        .select()
        .single()

      if (pollError) {
        alert('Error creating poll: ' + pollError.message)
        return
      }

      const optionsToInsert = validOptions.map(option => {
        const bookId = parseInt(option)
        return {
          poll_id: pollData.id,
          option_text: isNaN(bookId) ? option : booksForPolls.find(b => b.id === bookId)?.title || option,
          book_id: isNaN(bookId) ? null : bookId
        }
      })

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsToInsert)

      if (optionsError) {
        alert('Error creating poll options: ' + optionsError.message)
      } else {
        alert('Poll created successfully!')
        setPollForm({ question: '', description: '', deadline: '', is_active: true })
        setPollOptions(['', '', ''])
        fetchPolls()
      }
    }
  }

  const editPoll = (poll) => {
    setEditingPoll(poll)
    setPollForm({
      question: poll.question,
      description: poll.description || '',
      deadline: poll.deadline ? poll.deadline.split('T')[0] : '',
      is_active: poll.is_active
    })
    setPollOptions(poll.poll_options.map(opt => opt.option_text))
  }

  const deletePoll = async (id) => {
    if (!confirm('Are you sure you want to delete this poll?')) return

    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting poll: ' + error.message)
    } else {
      alert('Poll deleted!')
      fetchPolls()
    }
  }

  const togglePollActive = async (poll) => {
    const { error } = await supabase
      .from('polls')
      .update({ is_active: !poll.is_active })
      .eq('id', poll.id)

    if (error) {
      alert('Error updating poll: ' + error.message)
    } else {
      fetchPolls()
    }
  }

  const cancelPollEdit = () => {
    setEditingPoll(null)
    setPollForm({ question: '', description: '', deadline: '', is_active: true })
    setPollOptions(['', '', ''])
  }

  const addPollOption = () => {
    setPollOptions([...pollOptions, ''])
  }

  const removePollOption = (index) => {
    const newOptions = pollOptions.filter((_, i) => i !== index)
    setPollOptions(newOptions)
  }

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  // ========== COMMUNITY POSTS FUNCTIONS ==========
  // ... (keep all your existing post functions)
  
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error) {
      setPosts(data || [])
    }
  }

  const handlePostSubmit = async (e) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase.auth.getUser()

    if (editingPost) {
      const { error } = await supabase
        .from('community_posts')
        .update({
          ...postForm,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPost.id)

      if (error) {
        alert('Error updating post: ' + error.message)
      } else {
        alert('Post updated successfully!')
        setEditingPost(null)
        setPostForm({ title: '', content: '', is_pinned: false })
        fetchPosts()
      }
    } else {
      const { error } = await supabase
        .from('community_posts')
        .insert([{
          ...postForm,
          created_by: user.id
        }])

      if (error) {
        alert('Error creating post: ' + error.message)
      } else {
        alert('Post created successfully!')
        setPostForm({ title: '', content: '', is_pinned: false })
        fetchPosts()
      }
    }
  }

  const editPost = (post) => {
    setEditingPost(post)
    setPostForm({
      title: post.title,
      content: post.content,
      is_pinned: post.is_pinned
    })
  }

  const deletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting post: ' + error.message)
    } else {
      alert('Post deleted!')
      fetchPosts()
    }
  }

  const cancelPostEdit = () => {
    setEditingPost(null)
    setPostForm({ title: '', content: '', is_pinned: false })
  }

  // ========== EVENTS FUNCTIONS ==========
  // ... (keep all your existing event functions)

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })

    if (!error) {
      setEvents(data || [])
    }
  }

  const handleEventSubmit = async (e) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase.auth.getUser()

    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update({
          ...eventForm,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingEvent.id)

      if (error) {
        alert('Error updating event: ' + error.message)
      } else {
        alert('Event updated successfully!')
        setEditingEvent(null)
        setEventForm({ title: '', description: '', event_date: '', event_time: '', location: '' })
        fetchEvents()
      }
    } else {
      const { error } = await supabase
        .from('events')
        .insert([{
          ...eventForm,
          created_by: user.id
        }])

      if (error) {
        alert('Error creating event: ' + error.message)
      } else {
        alert('Event created successfully!')
        setEventForm({ title: '', description: '', event_date: '', event_time: '', location: '' })
        fetchEvents()
      }
    }
  }

  const editEvent = (event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      location: event.location || ''
    })
  }

  const deleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting event: ' + error.message)
    } else {
      alert('Event deleted!')
      fetchEvents()
    }
  }

  const cancelEventEdit = () => {
    setEditingEvent(null)
    setEventForm({ title: '', description: '', event_date: '', event_time: '', location: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // Calculate pending requests count
  const pendingRequests = accessRequests.filter(r => r.status === 'pending')
  const reviewedRequests = accessRequests.filter(r => r.status !== 'pending')

  return (
    <PageTemplate title="Admin Dashboard">
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔧 Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage books, polls, posts, events, and access requests</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                My Dashboard
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                View Site
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('books')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === 'books'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📚 Books ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === 'polls'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🗳️ Polls ({polls.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📢 Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors whitespace-nowrap ${
                activeTab === 'events'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('access')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors whitespace-nowrap relative ${
                activeTab === 'access'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔑 Access
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB CONTENT - Keep all your existing tabs (books, polls, posts, events) */}
        {/* I'll only show the new ACCESS tab here for brevity */}

        {/* Your existing BOOKS TAB code stays exactly the same */}
        {/* BOOKS TAB */}
        {activeTab === 'books' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Book Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingBook ? '✏️ Edit Book' : '➕ Add New Book'}
              </h2>
              <form onSubmit={handleBookSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={bookForm.title}
                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={bookForm.description}
                    onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief summary of the book..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={bookForm.cover_url}
                    onChange={(e) => setBookForm({ ...bookForm, cover_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/cover.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Search Google Images, right-click → "Copy image address"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <select
                      value={bookForm.genre}
                      onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select genre...</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Mystery">Mystery</option>
                      <option value="Thriller">Thriller</option>
                      <option value="Romance">Romance</option>
                      <option value="Sci-Fi">Science Fiction</option>
                      <option value="Fantasy">Fantasy</option>
                      <option value="Historical">Historical Fiction</option>
                      <option value="Biography">Biography</option>
                      <option value="Self-Help">Self-Help</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ISBN
                    </label>
                    <input
                      type="text"
                      value={bookForm.isbn}
                      onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="978-0-123456-78-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Published Year
                    </label>
                    <input
                      type="number"
                      value={bookForm.published_year}
                      onChange={(e) => setBookForm({ ...bookForm, published_year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2024"
                      min="1000"
                      max="2100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page Count
                    </label>
                    <input
                      type="number"
                      value={bookForm.page_count}
                      onChange={(e) => setBookForm({ ...bookForm, page_count: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="320"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    {editingBook ? 'Update Book' : 'Add Book'}
                  </button>
                  {editingBook && (
                    <button
                      type="button"
                      onClick={cancelBookEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Books List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Book Catalog</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {books.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No books yet</p>
                ) : (
                  books.map((book) => (
                    <div
                      key={book.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {book.cover_url ? (
                          <img
                            src={book.cover_url}
                            alt={book.title}
                            className="w-16 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No cover</span>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-gray-900">{book.title}</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => editBook(book)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteBook(book.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">by {book.author}</p>
                          {book.genre && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {book.genre}
                            </span>
                          )}
                          {book.description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {book.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {/* Your existing POLLS TAB code stays exactly the same */}
                {/* POLLS TAB */}
        {activeTab === 'polls' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Poll Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingPoll ? '✏️ Edit Poll' : '➕ Create New Poll'}
              </h2>
              <form onSubmit={handlePollSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={pollForm.question}
                    onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What should we read next month?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={pollForm.description}
                    onChange={(e) => setPollForm({ ...pollForm, description: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional details about the poll..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={pollForm.deadline}
                    onChange={(e) => setPollForm({ ...pollForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options * (at least 2)
                  </label>
                  {!editingPoll && (
                    <p className="text-xs text-gray-500 mb-3">
                      Tip: Select books from catalog or type custom options
                    </p>
                  )}
                  <div className="space-y-2">
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        {!editingPoll && booksForPolls.length > 0 ? (
                          <select
                            value={option}
                            onChange={(e) => updatePollOption(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Select book or type custom --</option>
                            {booksForPolls.map(book => (
                              <option key={book.id} value={book.id}>
                                {book.title} by {book.author}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updatePollOption(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${index + 1}`}
                          />
                        )}
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removePollOption(index)}
                            className="text-red-600 hover:text-red-800 px-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {!editingPoll && pollOptions.length < 6 && (
                    <button
                      type="button"
                      onClick={addPollOption}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add another option
                    </button>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={pollForm.is_active}
                    onChange={(e) => setPollForm({ ...pollForm, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Active (visible to members)
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    {editingPoll ? 'Update Poll' : 'Create Poll'}
                  </button>
                  {editingPoll && (
                    <button
                      type="button"
                      onClick={cancelPollEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Polls List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Active Polls</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {polls.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No polls yet</p>
                ) : (
                  polls.map((poll) => {
                    const totalVotes = poll.poll_options.reduce((sum, opt) => sum + opt.votes_count, 0)
                    return (
                      <div
                        key={poll.id}
                        className={`border rounded-lg p-4 ${
                          poll.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {poll.is_active && '🟢 '}
                              {poll.question}
                            </h3>
                            {poll.description && (
                              <p className="text-sm text-gray-600 mb-2">{poll.description}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                              {poll.deadline && ` • Ends ${new Date(poll.deadline).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-3">
                            <button
                              onClick={() => togglePollActive(poll)}
                              className={`text-xs px-3 py-1 rounded ${
                                poll.is_active
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {poll.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => editPoll(poll)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deletePoll(poll.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Poll Options */}
                        <div className="space-y-2 mt-3">
                          {poll.poll_options.map((option) => {
                            const percentage = totalVotes > 0 ? (option.votes_count / totalVotes * 100).toFixed(0) : 0
                            return (
                              <div key={option.id} className="relative">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium text-gray-700">{option.option_text}</span>
                                  <span className="text-gray-600">{option.votes_count} ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
        {/* Your existing POSTS TAB code stays exactly the same */}
                {/* COMMUNITY POSTS TAB */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Post Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingPost ? '✏️ Edit Post' : '➕ Create New Post'}
              </h2>
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_pinned"
                    checked={postForm.is_pinned}
                    onChange={(e) => setPostForm({ ...postForm, is_pinned: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_pinned" className="ml-2 text-sm text-gray-700">
                    📌 Pin this post (appears first)
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                  {editingPost && (
                    <button
                      type="button"
                      onClick={cancelPostEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Posts List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Existing Posts</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {posts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No posts yet</p>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {post.is_pinned && '📌 '}
                          {post.title}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editPost(post)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {/* Your existing EVENTS TAB code stays exactly the same */}
        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingEvent ? '✏️ Edit Event' : '➕ Create New Event'}
              </h2>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={eventForm.event_date}
                      onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.event_time}
                      onChange={(e) => setEventForm({ ...eventForm, event_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Community Center"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={cancelEventEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No events yet</p>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editEvent(event)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                      )}
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>📅 {new Date(event.event_date).toLocaleDateString()}</p>
                        {event.event_time && <p>🕐 {event.event_time}</p>}
                        {event.location && <p>📍 {event.location}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {/* NEW: ACCESS REQUESTS TAB */}
        {activeTab === 'access' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Access Requests Management
              </h2>
              <p className="text-gray-600">
                Review and approve new member requests
              </p>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                    {pendingRequests.length} Pending
                  </span>
                </h3>
                
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 shadow-md"
                    >
                      {/* Request Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                            {request.name}
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                              NEW
                            </span>
                          </h4>
                          <p className="text-gray-700 mb-1 flex items-center gap-2">
                            <span>📧</span>
                            <a href={`mailto:${request.email}`} className="hover:underline">
                              {request.email}
                            </a>
                          </p>
                          <p className="text-sm text-gray-500">
                            📅 Submitted {new Date(request.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Why they want to join */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          💬 Why they want to join:
                        </p>
                        <div className="bg-white p-4 rounded-lg border border-yellow-200">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {request.message}
                          </p>
                        </div>
                      </div>

                      {/* Favorite book */}
                      {request.favorite_book && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700">
                            📖 Favorite Book: <span className="font-normal text-gray-600">{request.favorite_book}</span>
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-yellow-300">
                        <button
                          onClick={() => approveRequest(request, 'user')}
                          disabled={processingRequest === request.id}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Approve as User
                        </button>
                        
                        <button
                          onClick={() => approveRequest(request, 'admin')}
                          disabled={processingRequest === request.id}
                          className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Approve as Admin
                        </button>
                        
                        <button
                          onClick={() => rejectRequest(request)}
                          disabled={processingRequest === request.id}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto shadow-md"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-12 text-center mb-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600 text-lg">No pending access requests at the moment.</p>
              </div>
            )}

            {/* Reviewed Requests */}
            {reviewedRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📋 Reviewed Requests</span>
                  <span className="text-sm text-gray-500 font-normal">
                    ({reviewedRequests.length})
                  </span>
                </h3>
                
                <div className="space-y-3">
                  {reviewedRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`border-2 rounded-lg p-4 ${
                        request.status === 'approved'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-gray-900">{request.name}</h4>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                              request.status === 'approved'
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                            }`}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{request.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Reviewed {new Date(request.reviewed_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          {request.notes && (
                            <p className="text-xs text-gray-600 mt-2 italic bg-white/50 p-2 rounded">
                              Note: {request.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </PageTemplate>
  )
}