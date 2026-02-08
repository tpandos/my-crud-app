'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PollsDisplay() {
  const [polls, setPolls] = useState([])
  const [user, setUser] = useState(null)
  const [userVotes, setUserVotes] = useState({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchActivePolls()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      fetchUserVotes(user.id)
    }
  }

  const fetchActivePolls = async () => {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (
          *,
          books (title, author, cover_url)
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3)

    if (!error) {
      setPolls(data || [])
    }
    setLoading(false)
  }

  const fetchUserVotes = async (userId) => {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('poll_id, option_id')
      .eq('user_id', userId)

    if (!error) {
      const votesMap = {}
      data.forEach(vote => {
        votesMap[vote.poll_id] = vote.option_id
      })
      setUserVotes(votesMap)
    }
  }

  const handleVote = async (pollId, optionId) => {
    if (!user) {
      alert('Please sign in to vote')
      router.push('/login')
      return
    }

    // Check if already voted
    const existingVote = userVotes[pollId]

    if (existingVote === optionId) {
      // Remove vote
      const { error } = await supabase
        .from('poll_votes')
        .delete()
        .eq('poll_id', pollId)
        .eq('user_id', user.id)

      if (error) {
        alert('Error removing vote: ' + error.message)
      } else {
        const newVotes = { ...userVotes }
        delete newVotes[pollId]
        setUserVotes(newVotes)
        fetchActivePolls()
      }
    } else {
      if (existingVote) {
        // Change vote - delete old one first
        await supabase
          .from('poll_votes')
          .delete()
          .eq('poll_id', pollId)
          .eq('user_id', user.id)
      }

      // Add new vote
      const { error } = await supabase
        .from('poll_votes')
        .insert([{
          poll_id: pollId,
          option_id: optionId,
          user_id: user.id
        }])

      if (error) {
        alert('Error voting: ' + error.message)
      } else {
        setUserVotes({ ...userVotes, [pollId]: optionId })
        fetchActivePolls()
      }
    }
  }

  if (loading) {
    return null
  }

  if (polls.length === 0) {
    return null
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            🗳️ Active Polls
          </h2>
          <p className="text-gray-600 text-lg">
            Have your say! Vote on what we should read next
          </p>
        </div>

        <div className="space-y-8">
          {polls.map((poll) => {
            const totalVotes = poll.poll_options.reduce((sum, opt) => sum + opt.votes_count, 0)
            const userVoted = userVotes[poll.id]
            const deadline = poll.deadline ? new Date(poll.deadline) : null
            const isExpired = deadline && deadline < new Date()

            return (
              <div
                key={poll.id}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg p-8 border border-blue-100"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {poll.question}
                  </h3>
                  {poll.description && (
                    <p className="text-gray-700 mb-3">{poll.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📊 {totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                    {deadline && (
                      <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                        ⏰ {isExpired ? 'Ended' : 'Ends'} {deadline.toLocaleDateString()}
                      </span>
                    )}
                    {userVoted && (
                      <span className="text-green-600 font-medium">✓ You voted</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {poll.poll_options.map((option) => {
                    const percentage = totalVotes > 0 ? (option.votes_count / totalVotes * 100).toFixed(0) : 0
                    const isSelected = userVoted === option.id

                    return (
                      <button
                        key={option.id}
                        onClick={() => !isExpired && handleVote(poll.id, option.id)}
                        disabled={isExpired}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-100'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        } ${isExpired ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-4 mb-2">
                          {option.books?.cover_url && (
                            <img
                              src={option.books.cover_url}
                              alt={option.option_text}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                {isSelected && '✓ '}
                                {option.option_text}
                              </span>
                              <span className={`text-sm ${isSelected ? 'text-blue-700 font-bold' : 'text-gray-600'}`}>
                                {option.votes_count} ({percentage}%)
                              </span>
                            </div>
                            {option.books && (
                              <p className="text-sm text-gray-600">
                                by {option.books.author}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isSelected ? 'bg-blue-600' : 'bg-gray-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>

                {!user && (
                  <p className="mt-4 text-center text-sm text-gray-600">
                    <button
                      onClick={() => router.push('/login')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Sign in to vote
                    </button>
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}