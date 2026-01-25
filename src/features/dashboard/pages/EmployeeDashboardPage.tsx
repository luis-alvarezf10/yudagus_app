import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import { REVIEW_STATUSES, DEFAULT_STATUS } from '@/features/reviews'

interface StatCard {
  title: string
  value: string | number
  icon: string
  color: string
}

interface Review {
  id: string
  title: string
  description: string
  part: string
  date: string
  id_status: number | null
  projects?: {
    name: string
  }
}

interface MyParticipation {
  id: string
  reviews: Review
  roles: {
    name: string
  }
}

export const EmployeeDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [todayReviews, setTodayReviews] = useState<MyParticipation[]>([])
  const [upcomingReviews, setUpcomingReviews] = useState<MyParticipation[]>([])
  const [totalParticipations, setTotalParticipations] = useState(0)
  const [loading, setLoading] = useState(true)

  const stats: StatCard[] = [
    {
      title: 'Revisiones Hoy',
      value: todayReviews.length,
      icon: '📅',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Próximas Revisiones',
      value: upcomingReviews.length,
      icon: '🔜',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Total Participaciones',
      value: totalParticipations,
      icon: '📊',
      color: 'from-green-500 to-emerald-500'
    },
  ]

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      // Revisiones de hoy
      const { data: todayData, error: todayError } = await supabase
        .from('participants')
        .select(`
          id,
          reviews!inner (
            id,
            title,
            description,
            part,
            date,
            id_status,
            projects (
              name
            )
          ),
          roles (
            name
          )
        `)
        .eq('id_employee', user?.id)
        .eq('reviews.date', today)

      if (todayError) throw todayError
      setTodayReviews(todayData as any || [])

      // Próximas revisiones (siguientes 7 días)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      const nextWeekStr = nextWeek.toISOString().split('T')[0]

      const { data: upcomingData, error: upcomingError } = await supabase
        .from('participants')
        .select(`
          id,
          reviews!inner (
            id,
            title,
            description,
            part,
            date,
            id_status,
            projects (
              name
            )
          ),
          roles (
            name
          )
        `)
        .eq('id_employee', user?.id)
        .gt('reviews.date', today)
        .lte('reviews.date', nextWeekStr)
        .order('reviews(date)', { ascending: true })

      if (upcomingError) throw upcomingError
      setUpcomingReviews(upcomingData as any || [])

      // Total de participaciones
      const { count, error: countError } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('id_employee', user?.id)

      if (countError) throw countError
      setTotalParticipations(count || 0)
    } catch (err) {
      console.error('Error al cargar datos:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (statusId: number | null) => {
    const status = statusId === null ? DEFAULT_STATUS : (REVIEW_STATUSES[statusId] || DEFAULT_STATUS)
    
    const colorClasses = {
      green: 'bg-green-500/10 text-green-500',
      red: 'bg-red-500/10 text-red-500',
      amber: 'bg-amber-500/10 text-amber-500',
      gray: 'bg-gray-500/10 text-gray-400'
    }

    return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${colorClasses[status.color as keyof typeof colorClasses]}`}>
        {status.name}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric' 
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-800 bg-[#111822] px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="text-blue-500 text-xl sm:text-2xl">👋</div>
          <div>
            <h2 className="text-white text-base sm:text-lg lg:text-xl font-bold">
              Bienvenido, {user?.name || 'Empleado'}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">Panel de Control</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-[#233348] text-gray-400 hover:text-white relative">
            <span className="text-lg sm:text-xl">🔔</span>
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 bg-[#111822] border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">{stat.title}</p>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-white text-2xl sm:text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Revisiones de Hoy */}
        <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-blue-500 text-xl">📅</span>
              <h2 className="text-white text-lg font-bold">Revisiones de Hoy</h2>
            </div>
            <button
              onClick={() => navigate('/my-reviews')}
              className="text-blue-500 text-sm hover:text-blue-400"
            >
              Ver todas →
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Cargando...
            </div>
          ) : todayReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span className="text-4xl mb-2 block">✨</span>
              <p>No tienes revisiones programadas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayReviews.map((participation) => (
                <div
                  key={participation.id}
                  onClick={() => navigate(`/reviews/${participation.reviews.id}`)}
                  className="p-4 rounded-lg bg-[#1a2332] border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{participation.reviews.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-1">{participation.reviews.description}</p>
                    </div>
                    {getStatusBadge(participation.reviews.id_status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>📁 {participation.reviews.projects?.name || 'N/A'}</span>
                    <span>🎭 {participation.roles.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximas Revisiones */}
        <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-blue-500 text-xl">🔜</span>
            <h2 className="text-white text-lg font-bold">Próximas Revisiones (7 días)</h2>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Cargando...
            </div>
          ) : upcomingReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span className="text-4xl mb-2 block">📭</span>
              <p>No tienes revisiones próximas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReviews.map((participation) => (
                <div
                  key={participation.id}
                  onClick={() => navigate(`/reviews/${participation.reviews.id}`)}
                  className="p-4 rounded-lg bg-[#1a2332] border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{participation.reviews.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-1">{participation.reviews.description}</p>
                    </div>
                    {getStatusBadge(participation.reviews.id_status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>📅 {formatDate(participation.reviews.date)}</span>
                    <span>📁 {participation.reviews.projects?.name || 'N/A'}</span>
                    <span>🎭 {participation.roles.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
