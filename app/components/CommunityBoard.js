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
      .limit(5)

    if (!error) {
      setPosts(data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        <p className="text-gray-500 mt-2 text-sm">Loading posts...</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-gray-400 text-lg">No announcements yet</p>
      </div>
    )
  }

  return (
    <div className="pl-10 pr-6 py-6">
      {/* Header with Bold Accent */}
      <div className="text-center mb-6 pb-4 border-b-4 border-rose-500">

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
            📌 Community Posts
        </h2>

        <p className="text-gray-600 text-sm mt-2 ml-13">
          Latest announcements from your book club
        </p>
      </div>

      {/* Posts */}
      <div className="space-y-4 space-x-5">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="group relative"
          >
            {/* Colored Left Border Accent */}
            <div className={`
              absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg
              ${post.is_pinned 
                ? 'bg-gradient-to-b from-rose-500 via-pink-500 to-rose-600' 
                : index % 3 === 0 
                  ? 'bg-gradient-to-b from-rose-400 to-rose-500'
                  : index % 3 === 1
                    ? 'bg-gradient-to-b from-pink-400 to-pink-500'
                    : 'bg-gradient-to-b from-orange-400 to-orange-500'
              }
            `}></div>

            {/* Card */}
            <div className={`
              relative pl-5 pr-4 py-4 rounded-lg
              border-2 transition-all duration-300
              ${post.is_pinned
                ? 'bg-gradient-to-r from-rose-50 via-white to-pink-50 border-rose-300 shadow-lg shadow-rose-100'
                : 'bg-white border-gray-200 hover:border-rose-300 hover:shadow-md'
              }
              group-hover:translate-x-1
            `}>
              
              {/* Top Row: Title & Badge */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900 flex-1 leading-tight">
                  {post.title}
                </h3>
                
                {post.is_pinned && (
                  <span className="flex-shrink-0 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
                    </svg>
                    Pinned
                  </span>
                )}
              </div>

              {/* Content */}
              <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-2">
                {post.content}
              </p>

              {/* Bottom Row: Date & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${post.is_pinned
                      ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                    }
                  `}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Arrow indicator */}
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center transition-all
                  ${post.is_pinned
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-gray-100 text-gray-400 group-hover:bg-rose-100 group-hover:text-rose-600'
                  }
                `}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-4 border-t-2 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">
              {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {posts.filter(p => p.is_pinned).length > 0 && (
              <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full font-medium">
                {posts.filter(p => p.is_pinned).length} Pinned
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
