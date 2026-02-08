'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function EventCalendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', today) // Only future events
      .order('event_date', { ascending: true })
      .limit(6) // Show next 6 events

    if (!error) {
      setEvents(data || [])
    }
    setLoading(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return null
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0]
    return dateString === today
  }

  const isThisWeek = (dateString) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    const weekFromNow = new Date()
    weekFromNow.setDate(today.getDate() + 7)
    return eventDate >= today && eventDate <= weekFromNow
  }

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500">Loading events...</p>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              📅 Upcoming Events
            </h2>
            <p className="text-gray-600 text-lg">
              No upcoming events scheduled at the moment
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            📅 Upcoming Events
          </h2>
          <p className="text-gray-600 text-lg">
            Join us at these exciting community events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 ${
                isToday(event.event_date)
                  ? 'border-red-500'
                  : isThisWeek(event.event_date)
                  ? 'border-orange-500'
                  : 'border-blue-500'
              }`}
            >
              <div className="mb-4">
                {isToday(event.event_date) && (
                  <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium">
                    Today
                  </span>
                )}
                {!isToday(event.event_date) && isThisWeek(event.event_date) && (
                  <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
                    This Week
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {event.title}
              </h3>

              {event.description && (
                <p className="text-gray-700 mb-4">
                  {event.description}
                </p>
              )}

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="mr-2">📅</span>
                  <span className="font-medium">{formatDate(event.event_date)}</span>
                </div>

                {event.event_time && (
                  <div className="flex items-center">
                    <span className="mr-2">🕐</span>
                    <span>{formatTime(event.event_time)}</span>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center">
                    <span className="mr-2">📍</span>
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}