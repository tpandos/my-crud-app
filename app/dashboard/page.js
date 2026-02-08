'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { isUserAdmin } from '@/lib/adminHelpers'
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
      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
    >
      🔧 Admin
    </Link>
  )
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
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
      fetchTodos()
    }
    setLoading(false)
  }

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      setTodos(data || [])
    }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('todos')
      .insert([{ title: newTodo, user_id: user.id }])

    if (error) {
      console.error('Error adding todo:', error)
      alert('Error adding todo: ' + error.message)
    } else {
      setNewTodo('')
      fetchTodos()
    }
  }

  const toggleTodo = async (id, is_complete) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_complete: !is_complete })
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
    } else {
      fetchTodos()
    }
  }

  const deleteTodo = async (id) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
    } else {
      fetchTodos()
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600 mt-1">Logged in as: {user?.email}</p>
            </div>
            <div className="flex gap-3">
              <AdminLink />
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Add Todo Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={addTodo}>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What do you need to do?"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Add Todo
              </button>
            </div>
          </form>
        </div>

        {/* Todos List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No todos yet. Add one above to get started! 🚀
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={todo.is_complete}
                    onChange={() => toggleTodo(todo.id, todo.is_complete)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span
                    className={`text-lg ${
                      todo.is_complete
                        ? 'line-through text-gray-400'
                        : 'text-gray-900'
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{todos.length}</p>
                <p className="text-gray-600 text-sm">Total Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {todos.filter(t => t.is_complete).length}
                </p>
                <p className="text-gray-600 text-sm">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {todos.filter(t => !t.is_complete).length}
                </p>
                <p className="text-gray-600 text-sm">Remaining</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}