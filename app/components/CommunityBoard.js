'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CommunityBoard() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5) // Show only latest 5 posts

    if (!error) {
      setPosts(data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500">Loading community posts...</p>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return null // Don't show section if no posts
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            📢 Community Board
          </h2>
          <p className="text-gray-600 text-lg">
            Latest announcements and updates from our community
          </p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow ${
                post.is_pinned
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {post.is_pinned && (
                    <span className="inline-block mr-2">📌</span>
                  )}
                  {post.title}
                </h3>
                {post.is_pinned && (
                  <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Pinned
                  </span>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap mb-3">
                {post.content}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}