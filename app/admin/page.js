'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { isUserAdmin } from '@/lib/adminHelpers'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('posts') // 'posts' or 'events'
  
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

  const router = useRouter()

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const adminStatus = await isUserAdmin()
    
    if (!adminStatus) {
      alert('Access denied. Admin privileges required.')
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
    fetchPosts()
    fetchEvents()
    setLoading(false)
  }

  // ========== COMMUNITY POSTS FUNCTIONS ==========
  
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
      // Update existing post
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
      // Create new post
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
      // Update existing event
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
      // Create new event
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔧 Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage community posts and events</p>
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
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📢 Community Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'events'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Events ({events.length})
            </button>
          </div>
        </div>

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
      </div>
    </div>
  )
}